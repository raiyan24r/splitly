import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\PaymentController::store
* @see app/Http/Controllers/PaymentController.php:19
* @route '/g/{group}/payments'
*/
export const store = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/g/{group}/payments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PaymentController::store
* @see app/Http/Controllers/PaymentController.php:19
* @route '/g/{group}/payments'
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
* @see \App\Http\Controllers\PaymentController::store
* @see app/Http/Controllers/PaymentController.php:19
* @route '/g/{group}/payments'
*/
store.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PaymentController::store
* @see app/Http/Controllers/PaymentController.php:19
* @route '/g/{group}/payments'
*/
const storeForm = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PaymentController::store
* @see app/Http/Controllers/PaymentController.php:19
* @route '/g/{group}/payments'
*/
storeForm.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\PaymentController::update
* @see app/Http/Controllers/PaymentController.php:37
* @route '/g/{group}/payments/{payment}'
*/
export const update = (args: { group: string | { slug: string }, payment: number | { id: number } } | [group: string | { slug: string }, payment: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/g/{group}/payments/{payment}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\PaymentController::update
* @see app/Http/Controllers/PaymentController.php:37
* @route '/g/{group}/payments/{payment}'
*/
update.url = (args: { group: string | { slug: string }, payment: number | { id: number } } | [group: string | { slug: string }, payment: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            group: args[0],
            payment: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        group: typeof args.group === 'object'
        ? args.group.slug
        : args.group,
        payment: typeof args.payment === 'object'
        ? args.payment.id
        : args.payment,
    }

    return update.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace('{payment}', parsedArgs.payment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PaymentController::update
* @see app/Http/Controllers/PaymentController.php:37
* @route '/g/{group}/payments/{payment}'
*/
update.put = (args: { group: string | { slug: string }, payment: number | { id: number } } | [group: string | { slug: string }, payment: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\PaymentController::update
* @see app/Http/Controllers/PaymentController.php:37
* @route '/g/{group}/payments/{payment}'
*/
const updateForm = (args: { group: string | { slug: string }, payment: number | { id: number } } | [group: string | { slug: string }, payment: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PaymentController::update
* @see app/Http/Controllers/PaymentController.php:37
* @route '/g/{group}/payments/{payment}'
*/
updateForm.put = (args: { group: string | { slug: string }, payment: number | { id: number } } | [group: string | { slug: string }, payment: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\PaymentController::destroy
* @see app/Http/Controllers/PaymentController.php:52
* @route '/g/{group}/payments/{payment}'
*/
export const destroy = (args: { group: string | { slug: string }, payment: number | { id: number } } | [group: string | { slug: string }, payment: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/g/{group}/payments/{payment}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PaymentController::destroy
* @see app/Http/Controllers/PaymentController.php:52
* @route '/g/{group}/payments/{payment}'
*/
destroy.url = (args: { group: string | { slug: string }, payment: number | { id: number } } | [group: string | { slug: string }, payment: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            group: args[0],
            payment: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        group: typeof args.group === 'object'
        ? args.group.slug
        : args.group,
        payment: typeof args.payment === 'object'
        ? args.payment.id
        : args.payment,
    }

    return destroy.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace('{payment}', parsedArgs.payment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PaymentController::destroy
* @see app/Http/Controllers/PaymentController.php:52
* @route '/g/{group}/payments/{payment}'
*/
destroy.delete = (args: { group: string | { slug: string }, payment: number | { id: number } } | [group: string | { slug: string }, payment: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\PaymentController::destroy
* @see app/Http/Controllers/PaymentController.php:52
* @route '/g/{group}/payments/{payment}'
*/
const destroyForm = (args: { group: string | { slug: string }, payment: number | { id: number } } | [group: string | { slug: string }, payment: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PaymentController::destroy
* @see app/Http/Controllers/PaymentController.php:52
* @route '/g/{group}/payments/{payment}'
*/
destroyForm.delete = (args: { group: string | { slug: string }, payment: number | { id: number } } | [group: string | { slug: string }, payment: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const payments = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default payments