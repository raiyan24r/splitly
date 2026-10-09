export type SplitType =
    | 'equal'
    | 'exact'
    | 'percent'
    | 'shares'
    | 'adjustment'
    | 'claim';

export type GroupInfo = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    currency: string;
    exponent: number;
    simplify_debts: boolean;
    archived: boolean;
    url: string;
};

export type Member = {
    id: number;
    name: string;
    color: string;
    removed: boolean;
};

export type Comment = {
    id: number;
    member_id: number | null;
    author_name: string;
    body: string;
    created_at: string;
};

export type Expense = {
    id: number;
    description: string;
    amount: number;
    category: string;
    spent_at: string;
    split_type: SplitType;
    notes: string | null;
    receipt_url: string | null;
    receipt_is_pdf: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    payers: { member_id: number; amount: number }[];
    /** Claim splits: input_value is null until that person has claimed. */
    splits: { member_id: number; amount: number; input_value: string | null }[];
    /** Claim expenses: the part nobody has claimed yet (it stays with the payers). */
    unclaimed: number;
    comments: Comment[];
};

export type Payment = {
    id: number;
    from: number;
    to: number;
    amount: number;
    paid_at: string;
    note: string | null;
    created_at: string;
};

export type Transfer = { from: number; to: number; amount: number };

export type Balances = {
    net: Record<number, number>;
    paid: Record<number, number>;
    share: Record<number, number>;
    pairwise: Transfer[];
    simplified: Transfer[];
    total_spent: number;
};

export type ActivityItem = {
    id: number;
    actor_name: string;
    actor_member_id: number | null;
    action: string;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    /** "Chrome on iPhone" */
    device: string | null;
    /** Short stable tag telling devices apart, e.g. "7F3A". */
    device_tag: string | null;
    /** Names this device had used in the group up to this entry, oldest first. */
    device_trail: string[];
    created_at: string;
};

export type DeletedExpense = {
    id: number;
    description: string;
    amount: number;
    deleted_at: string;
};

export type GroupPageProps = {
    group: GroupInfo;
    members: Member[];
    expenses: Expense[];
    payments: Payment[];
    deletedExpenses: DeletedExpense[];
    activity: ActivityItem[];
    balances: Balances;
    categories: string[];
    isAdmin: boolean;
};
