import { initials } from '@/components/group/member-avatar';
import { formatDateTime } from '@/components/group/time';
import type { Balances, GroupInfo, Member, Transfer } from '@/types/group';

/** The app's dark theme as hex (canvas support for oklch is patchy). */
const COLORS = {
    background: '#09090b',
    card: '#18181b',
    border: '#27272a',
    text: '#fafafa',
    muted: '#a1a1aa',
    primary: '#00d492',
    owed: '#05df72',
    owe: '#ff637e',
};

const FONT = 'Inter, system-ui, sans-serif';
const WIDTH = 540;
const SCALE = 2;
const PAD = 28;
const ROW = 56;
const HEADER = 84;
const SECTION_TITLE = 30;
const SECTION_GAP = 24;
const FOOTER = 52;

type Input = {
    group: GroupInfo;
    members: Member[];
    balances: Balances;
    transfers: Transfer[];
    money: (minor: number) => string;
};

/**
 * Draws a shareable PNG of who pays whom and everyone's balance, using real
 * names (the picture is meant for the whole group chat, not just "you").
 */
export async function renderBalanceSnapshot({
    group,
    members,
    balances,
    transfers,
    money,
}: Input): Promise<Blob> {
    await Promise.all([
        document.fonts.load(`400 16px ${FONT}`),
        document.fonts.load(`700 16px ${FONT}`),
    ]).catch(() => undefined);

    const byId = new Map(members.map((m) => [m.id, m]));
    const people = members
        .filter((m) => !m.removed || (balances.net[m.id] ?? 0) !== 0)
        .sort((a, b) => (balances.net[b.id] ?? 0) - (balances.net[a.id] ?? 0));

    const transferRows = Math.max(transfers.length, 1);
    const height =
        PAD +
        HEADER +
        SECTION_TITLE +
        transferRows * ROW +
        SECTION_GAP +
        SECTION_TITLE +
        Math.max(people.length, 1) * ROW +
        FOOTER;

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH * SCALE;
    canvas.height = height * SCALE;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Canvas is not supported in this browser.');
    }

    ctx.scale(SCALE, SCALE);
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, WIDTH, height);

    const right = WIDTH - PAD - 16;
    let y = PAD;

    // Header
    write(ctx, fit(ctx, group.name, WIDTH - PAD * 2, 24, 700), PAD, y + 26, {
        size: 24,
        weight: 700,
    });
    write(
        ctx,
        `Balances as of ${formatDateTime(new Date().toISOString())} · ${group.currency}`,
        PAD,
        y + 52,
        { size: 13, color: COLORS.muted },
    );
    y += HEADER;

    // Who pays whom
    y = sectionTitle(ctx, 'WHO PAYS WHOM', y);
    y = card(ctx, y, transferRows, (rowY, i) => {
        const t = transfers[i];

        if (!t) {
            write(ctx, 'Everyone is settled up 🎉', PAD + 16, rowY + 34, {
                size: 15,
            });

            return;
        }

        const from = byId.get(t.from);
        const to = byId.get(t.to);
        // Side by side, not overlapping, so both people's initials stay readable.
        avatar(ctx, from, PAD + 30, rowY + ROW / 2);
        avatar(ctx, to, PAD + 64, rowY + ROW / 2);

        const amount = money(t.amount);
        const amountWidth = measure(ctx, amount, 15, 700);
        const textX = PAD + 92;
        const pays = ' pays ';
        const nameRoom =
            (right - amountWidth - 16 - textX - measure(ctx, pays, 15, 400)) /
            2;
        const fromName = fit(ctx, nameOf(from), nameRoom, 15, 700);
        const toName = fit(ctx, nameOf(to), nameRoom, 15, 700);

        let x = textX;
        x += write(ctx, fromName, x, rowY + 34, { size: 15, weight: 700 });
        x += write(ctx, pays, x, rowY + 34, { size: 15, color: COLORS.muted });
        write(ctx, toName, x, rowY + 34, { size: 15, weight: 700 });
        write(ctx, amount, right, rowY + 34, {
            size: 15,
            weight: 700,
            align: 'right',
        });
    });
    y += SECTION_GAP;

    // Everyone's balance
    y = sectionTitle(ctx, 'BALANCES', y);
    y = card(ctx, y, Math.max(people.length, 1), (rowY, i) => {
        const m = people[i];

        if (!m) {
            write(ctx, 'No members yet', PAD + 16, rowY + 34, {
                size: 15,
                color: COLORS.muted,
            });

            return;
        }

        const net = balances.net[m.id] ?? 0;
        const amount = net === 0 ? '' : money(Math.abs(net));
        const amountWidth = Math.max(
            measure(ctx, amount, 15, 700),
            measure(ctx, 'gets back', 11, 400),
        );

        avatar(ctx, m, PAD + 30, rowY + ROW / 2);
        write(
            ctx,
            fit(ctx, nameOf(m), right - amountWidth - 16 - (PAD + 56), 15, 600),
            PAD + 56,
            rowY + 34,
            { size: 15, weight: 600 },
        );

        if (net === 0) {
            write(ctx, 'settled', right, rowY + 34, {
                size: 13,
                color: COLORS.muted,
                align: 'right',
            });

            return;
        }

        const color = net > 0 ? COLORS.owed : COLORS.owe;
        write(ctx, net > 0 ? 'gets back' : 'owes', right, rowY + 22, {
            size: 11,
            color,
            align: 'right',
        });
        write(ctx, amount, right, rowY + 41, {
            size: 15,
            weight: 700,
            color,
            align: 'right',
        });
    });

    // Footer
    write(ctx, 'splitly', PAD, y + 32, {
        size: 13,
        weight: 700,
        color: COLORS.primary,
    });

    return new Promise((resolve, reject) =>
        canvas.toBlob(
            (blob) =>
                blob
                    ? resolve(blob)
                    : reject(new Error('Could not create the image.')),
            'image/png',
        ),
    );
}

function nameOf(member: Member | undefined) {
    if (!member) {
        return 'Someone';
    }

    return member.removed ? `${member.name} (left)` : member.name;
}

function font(size: number, weight: number) {
    return `${weight} ${size}px ${FONT}`;
}

function measure(
    ctx: CanvasRenderingContext2D,
    text: string,
    size: number,
    weight: number,
) {
    ctx.font = font(size, weight);

    return ctx.measureText(text).width;
}

/** Shorten text with "…" until it fits in maxWidth. */
function fit(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    size: number,
    weight: number,
) {
    if (measure(ctx, text, size, weight) <= maxWidth) {
        return text;
    }

    let short = text;

    while (
        short.length > 1 &&
        measure(ctx, `${short}…`, size, weight) > maxWidth
    ) {
        short = short.slice(0, -1);
    }

    return `${short.trimEnd()}…`;
}

/** Draws text and returns its width. */
function write(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    {
        size,
        weight = 400,
        color = COLORS.text,
        align = 'left',
    }: {
        size: number;
        weight?: number;
        color?: string;
        align?: CanvasTextAlign;
    },
) {
    ctx.font = font(size, weight);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);

    return ctx.measureText(text).width;
}

function sectionTitle(ctx: CanvasRenderingContext2D, title: string, y: number) {
    write(ctx, title, PAD, y + 16, {
        size: 11,
        weight: 600,
        color: COLORS.muted,
    });

    return y + SECTION_TITLE;
}

/** A rounded card of equal-height rows with dividers; returns the y below it. */
function card(
    ctx: CanvasRenderingContext2D,
    y: number,
    rows: number,
    drawRow: (rowY: number, index: number) => void,
) {
    const height = rows * ROW;

    ctx.beginPath();
    ctx.roundRect(PAD, y, WIDTH - PAD * 2, height, 16);
    ctx.fillStyle = COLORS.card;
    ctx.fill();
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    for (let i = 0; i < rows; i++) {
        if (i > 0) {
            ctx.beginPath();
            ctx.moveTo(PAD + 16, y + i * ROW);
            ctx.lineTo(WIDTH - PAD - 16, y + i * ROW);
            ctx.stroke();
        }

        drawRow(y + i * ROW, i);
    }

    return y + height;
}

/** Same look as <MemberAvatar>: tinted circle with coloured initials. */
function avatar(
    ctx: CanvasRenderingContext2D,
    member: Member | undefined,
    cx: number,
    cy: number,
) {
    const color = member?.color ?? '#71717a';

    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fillStyle = `${color}26`;
    ctx.fill();
    ctx.strokeStyle = `${color}40`;
    ctx.stroke();

    ctx.font = font(11, 700);
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(member ? initials(member.name) : '?', cx, cy + 0.5);
    ctx.textBaseline = 'alphabetic';
    ctx.strokeStyle = COLORS.border;
}
