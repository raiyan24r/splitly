import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\MemberController::store
* @see app/Http/Controllers/MemberController.php:19
* @route '/g/{group}/members'
*/
export const store = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/g/{group}/members',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MemberController::store
* @see app/Http/Controllers/MemberController.php:19
* @route '/g/{group}/members'
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
* @see \App\Http\Controllers\MemberController::store
* @see app/Http/Controllers/MemberController.php:19
* @route '/g/{group}/members'
*/
store.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MemberController::store
* @see app/Http/Controllers/MemberController.php:19
* @route '/g/{group}/members'
*/
const storeForm = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MemberController::store
* @see app/Http/Controllers/MemberController.php:19
* @route '/g/{group}/members'
*/
storeForm.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\MemberController::update
* @see app/Http/Controllers/MemberController.php:44
* @route '/g/{group}/members/{member}'
*/
export const update = (args: { group: string | { slug: string }, member: number | { id: number } } | [group: string | { slug: string }, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/g/{group}/members/{member}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\MemberController::update
* @see app/Http/Controllers/MemberController.php:44
* @route '/g/{group}/members/{member}'
*/
update.url = (args: { group: string | { slug: string }, member: number | { id: number } } | [group: string | { slug: string }, member: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            group: args[0],
            member: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        group: typeof args.group === 'object'
        ? args.group.slug
        : args.group,
        member: typeof args.member === 'object'
        ? args.member.id
        : args.member,
    }

    return update.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MemberController::update
* @see app/Http/Controllers/MemberController.php:44
* @route '/g/{group}/members/{member}'
*/
update.patch = (args: { group: string | { slug: string }, member: number | { id: number } } | [group: string | { slug: string }, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\MemberController::update
* @see app/Http/Controllers/MemberController.php:44
* @route '/g/{group}/members/{member}'
*/
const updateForm = (args: { group: string | { slug: string }, member: number | { id: number } } | [group: string | { slug: string }, member: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MemberController::update
* @see app/Http/Controllers/MemberController.php:44
* @route '/g/{group}/members/{member}'
*/
updateForm.patch = (args: { group: string | { slug: string }, member: number | { id: number } } | [group: string | { slug: string }, member: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\MemberController::destroy
* @see app/Http/Controllers/MemberController.php:62
* @route '/g/{group}/members/{member}'
*/
export const destroy = (args: { group: string | { slug: string }, member: number | { id: number } } | [group: string | { slug: string }, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/g/{group}/members/{member}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\MemberController::destroy
* @see app/Http/Controllers/MemberController.php:62
* @route '/g/{group}/members/{member}'
*/
destroy.url = (args: { group: string | { slug: string }, member: number | { id: number } } | [group: string | { slug: string }, member: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            group: args[0],
            member: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        group: typeof args.group === 'object'
        ? args.group.slug
        : args.group,
        member: typeof args.member === 'object'
        ? args.member.id
        : args.member,
    }

    return destroy.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace('{member}', parsedArgs.member.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MemberController::destroy
* @see app/Http/Controllers/MemberController.php:62
* @route '/g/{group}/members/{member}'
*/
destroy.delete = (args: { group: string | { slug: string }, member: number | { id: number } } | [group: string | { slug: string }, member: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\MemberController::destroy
* @see app/Http/Controllers/MemberController.php:62
* @route '/g/{group}/members/{member}'
*/
const destroyForm = (args: { group: string | { slug: string }, member: number | { id: number } } | [group: string | { slug: string }, member: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MemberController::destroy
* @see app/Http/Controllers/MemberController.php:62
* @route '/g/{group}/members/{member}'
*/
destroyForm.delete = (args: { group: string | { slug: string }, member: number | { id: number } } | [group: string | { slug: string }, member: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const members = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default members