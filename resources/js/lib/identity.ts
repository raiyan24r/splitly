import { http } from '@inertiajs/react';
import { useCallback, useSyncExternalStore } from 'react';

/**
 * "Who am I in this group" lives only in this browser's localStorage,
 * keyed per group. Every Inertia request made while a group page is open
 * carries it as the X-Member-Id header so the server can attribute the
 * change in the audit log.
 */

const keyFor = (groupId: number) => `splitly:member:${groupId}`;

const listeners = new Set<() => void>();
let activeGroupId: number | null = null;

function read(groupId: number): number | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const value = Number(localStorage.getItem(keyFor(groupId)));

    return Number.isInteger(value) && value > 0 ? value : null;
}

export function setMemberFor(groupId: number, memberId: number | null): void {
    if (memberId === null) {
        localStorage.removeItem(keyFor(groupId));
    } else {
        localStorage.setItem(keyFor(groupId), String(memberId));
    }

    listeners.forEach((listener) => listener());
}

export function setActiveGroup(groupId: number | null): void {
    activeGroupId = groupId;
}

const DEVICE_KEY = 'splitly:device';

/**
 * A random id for this browser, kept forever in localStorage, so the audit
 * log can show which device did what (and which names it switched between).
 */
function deviceId(): string {
    let id = localStorage.getItem(DEVICE_KEY);

    if (!id) {
        // crypto.randomUUID only exists on secure origins (https / localhost).
        id =
            typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
                      b.toString(16).padStart(2, '0'),
                  ).join('');
        localStorage.setItem(DEVICE_KEY, id);
    }

    return id;
}

export function installIdentityHeader(): void {
    http.onRequest((config) => {
        const memberId = activeGroupId ? read(activeGroupId) : null;

        config.headers = {
            ...config.headers,
            'X-Device-Id': deviceId(),
            ...(memberId ? { 'X-Member-Id': String(memberId) } : {}),
        };

        return config;
    });
}

function subscribe(callback: () => void) {
    listeners.add(callback);

    const onStorage = (event: StorageEvent) => {
        if (event.key?.startsWith('splitly:member:')) {
            callback();
        }
    };

    window.addEventListener('storage', onStorage);

    return () => {
        listeners.delete(callback);
        window.removeEventListener('storage', onStorage);
    };
}

export function useGroupIdentity(groupId: number) {
    const memberId = useSyncExternalStore(
        subscribe,
        () => read(groupId),
        () => null,
    );

    const setMember = useCallback(
        (id: number | null) => setMemberFor(groupId, id),
        [groupId],
    );

    return [memberId, setMember] as const;
}
