import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ExpenseController::receipt
* @see app/Http/Controllers/ExpenseController.php:76
* @route '/g/{group}/expenses/{expense}/receipt'
*/
export const receipt = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: receipt.url(args, options),
    method: 'get',
})

receipt.definition = {
    methods: ["get","head"],
    url: '/g/{group}/expenses/{expense}/receipt',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ExpenseController::receipt
* @see app/Http/Controllers/ExpenseController.php:76
* @route '/g/{group}/expenses/{expense}/receipt'
*/
receipt.url = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            group: args[0],
            expense: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        group: typeof args.group === 'object'
        ? args.group.slug
        : args.group,
        expense: typeof args.expense === 'object'
        ? args.expense.id
        : args.expense,
    }

    return receipt.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace('{expense}', parsedArgs.expense.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ExpenseController::receipt
* @see app/Http/Controllers/ExpenseController.php:76
* @route '/g/{group}/expenses/{expense}/receipt'
*/
receipt.get = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: receipt.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExpenseController::receipt
* @see app/Http/Controllers/ExpenseController.php:76
* @route '/g/{group}/expenses/{expense}/receipt'
*/
receipt.head = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: receipt.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ExpenseController::receipt
* @see app/Http/Controllers/ExpenseController.php:76
* @route '/g/{group}/expenses/{expense}/receipt'
*/
const receiptForm = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: receipt.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExpenseController::receipt
* @see app/Http/Controllers/ExpenseController.php:76
* @route '/g/{group}/expenses/{expense}/receipt'
*/
receiptForm.get = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: receipt.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExpenseController::receipt
* @see app/Http/Controllers/ExpenseController.php:76
* @route '/g/{group}/expenses/{expense}/receipt'
*/
receiptForm.head = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: receipt.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

receipt.form = receiptForm

/**
* @see \App\Http\Controllers\ExpenseController::store
* @see app/Http/Controllers/ExpenseController.php:18
* @route '/g/{group}/expenses'
*/
export const store = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/g/{group}/expenses',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ExpenseController::store
* @see app/Http/Controllers/ExpenseController.php:18
* @route '/g/{group}/expenses'
*/
store.url = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { group: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'slug' in args) {
        args = { group: args.slug }
    }

    if (Array.isArray(args)) {
        args = {
            group: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        group: typeof args.group === 'object'
        ? args.group.slug
        : args.group,
    }

    return store.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ExpenseController::store
* @see app/Http/Controllers/ExpenseController.php:18
* @route '/g/{group}/expenses'
*/
store.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ExpenseController::store
* @see app/Http/Controllers/ExpenseController.php:18
* @route '/g/{group}/expenses'
*/
const storeForm = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ExpenseController::store
* @see app/Http/Controllers/ExpenseController.php:18
* @route '/g/{group}/expenses'
*/
storeForm.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\ExpenseController::update
* @see app/Http/Controllers/ExpenseController.php:27
* @route '/g/{group}/expenses/{expense}'
*/
export const update = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/g/{group}/expenses/{expense}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ExpenseController::update
* @see app/Http/Controllers/ExpenseController.php:27
* @route '/g/{group}/expenses/{expense}'
*/
update.url = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            group: args[0],
            expense: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        group: typeof args.group === 'object'
        ? args.group.slug
        : args.group,
        expense: typeof args.expense === 'object'
        ? args.expense.id
        : args.expense,
    }

    return update.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace('{expense}', parsedArgs.expense.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ExpenseController::update
* @see app/Http/Controllers/ExpenseController.php:27
* @route '/g/{group}/expenses/{expense}'
*/
update.put = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ExpenseController::update
* @see app/Http/Controllers/ExpenseController.php:27
* @route '/g/{group}/expenses/{expense}'
*/
const updateForm = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ExpenseController::update
* @see app/Http/Controllers/ExpenseController.php:27
* @route '/g/{group}/expenses/{expense}'
*/
updateForm.put = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\ExpenseController::destroy
* @see app/Http/Controllers/ExpenseController.php:36
* @route '/g/{group}/expenses/{expense}'
*/
export const destroy = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/g/{group}/expenses/{expense}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ExpenseController::destroy
* @see app/Http/Controllers/ExpenseController.php:36
* @route '/g/{group}/expenses/{expense}'
*/
destroy.url = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            group: args[0],
            expense: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        group: typeof args.group === 'object'
        ? args.group.slug
        : args.group,
        expense: typeof args.expense === 'object'
        ? args.expense.id
        : args.expense,
    }

    return destroy.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace('{expense}', parsedArgs.expense.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ExpenseController::destroy
* @see app/Http/Controllers/ExpenseController.php:36
* @route '/g/{group}/expenses/{expense}'
*/
destroy.delete = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ExpenseController::destroy
* @see app/Http/Controllers/ExpenseController.php:36
* @route '/g/{group}/expenses/{expense}'
*/
const destroyForm = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ExpenseController::destroy
* @see app/Http/Controllers/ExpenseController.php:36
* @route '/g/{group}/expenses/{expense}'
*/
destroyForm.delete = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\ExpenseController::restore
* @see app/Http/Controllers/ExpenseController.php:51
* @route '/g/{group}/expenses/{expense}/restore'
*/
export const restore = (args: { group: string | { slug: string }, expense: string | number } | [group: string | { slug: string }, expense: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

restore.definition = {
    methods: ["post"],
    url: '/g/{group}/expenses/{expense}/restore',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ExpenseController::restore
* @see app/Http/Controllers/ExpenseController.php:51
* @route '/g/{group}/expenses/{expense}/restore'
*/
restore.url = (args: { group: string | { slug: string }, expense: string | number } | [group: string | { slug: string }, expense: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            group: args[0],
            expense: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        group: typeof args.group === 'object'
        ? args.group.slug
        : args.group,
        expense: args.expense,
    }

    return restore.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace('{expense}', parsedArgs.expense.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ExpenseController::restore
* @see app/Http/Controllers/ExpenseController.php:51
* @route '/g/{group}/expenses/{expense}/restore'
*/
restore.post = (args: { group: string | { slug: string }, expense: string | number } | [group: string | { slug: string }, expense: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ExpenseController::restore
* @see app/Http/Controllers/ExpenseController.php:51
* @route '/g/{group}/expenses/{expense}/restore'
*/
const restoreForm = (args: { group: string | { slug: string }, expense: string | number } | [group: string | { slug: string }, expense: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: restore.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ExpenseController::restore
* @see app/Http/Controllers/ExpenseController.php:51
* @route '/g/{group}/expenses/{expense}/restore'
*/
restoreForm.post = (args: { group: string | { slug: string }, expense: string | number } | [group: string | { slug: string }, expense: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: restore.url(args, options),
    method: 'post',
})

restore.form = restoreForm

const expenses = {
    receipt: Object.assign(receipt, receipt),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    restore: Object.assign(restore, restore),
}

export default expenses