import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\GroupController::show
* @see app/Http/Controllers/GroupController.php:26
* @route '/g/{group}'
*/
export const show = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/g/{group}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GroupController::show
* @see app/Http/Controllers/GroupController.php:26
* @route '/g/{group}'
*/
show.url = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GroupController::show
* @see app/Http/Controllers/GroupController.php:26
* @route '/g/{group}'
*/
show.get = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GroupController::show
* @see app/Http/Controllers/GroupController.php:26
* @route '/g/{group}'
*/
show.head = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\GroupController::show
* @see app/Http/Controllers/GroupController.php:26
* @route '/g/{group}'
*/
const showForm = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GroupController::show
* @see app/Http/Controllers/GroupController.php:26
* @route '/g/{group}'
*/
showForm.get = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GroupController::show
* @see app/Http/Controllers/GroupController.php:26
* @route '/g/{group}'
*/
showForm.head = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\GroupController::unlock
* @see app/Http/Controllers/GroupController.php:37
* @route '/g/{group}/unlock'
*/
export const unlock = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unlock.url(args, options),
    method: 'post',
})

unlock.definition = {
    methods: ["post"],
    url: '/g/{group}/unlock',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\GroupController::unlock
* @see app/Http/Controllers/GroupController.php:37
* @route '/g/{group}/unlock'
*/
unlock.url = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return unlock.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GroupController::unlock
* @see app/Http/Controllers/GroupController.php:37
* @route '/g/{group}/unlock'
*/
unlock.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unlock.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GroupController::unlock
* @see app/Http/Controllers/GroupController.php:37
* @route '/g/{group}/unlock'
*/
const unlockForm = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: unlock.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GroupController::unlock
* @see app/Http/Controllers/GroupController.php:37
* @route '/g/{group}/unlock'
*/
unlockForm.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: unlock.url(args, options),
    method: 'post',
})

unlock.form = unlockForm

/**
* @see \App\Http\Controllers\GroupController::lock
* @see app/Http/Controllers/GroupController.php:66
* @route '/g/{group}/lock'
*/
export const lock = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: lock.url(args, options),
    method: 'post',
})

lock.definition = {
    methods: ["post"],
    url: '/g/{group}/lock',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\GroupController::lock
* @see app/Http/Controllers/GroupController.php:66
* @route '/g/{group}/lock'
*/
lock.url = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return lock.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GroupController::lock
* @see app/Http/Controllers/GroupController.php:66
* @route '/g/{group}/lock'
*/
lock.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: lock.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GroupController::lock
* @see app/Http/Controllers/GroupController.php:66
* @route '/g/{group}/lock'
*/
const lockForm = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: lock.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GroupController::lock
* @see app/Http/Controllers/GroupController.php:66
* @route '/g/{group}/lock'
*/
lockForm.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: lock.url(args, options),
    method: 'post',
})

lock.form = lockForm

/**
* @see \App\Http\Controllers\GroupController::identify
* @see app/Http/Controllers/GroupController.php:80
* @route '/g/{group}/identity'
*/
export const identify = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: identify.url(args, options),
    method: 'post',
})

identify.definition = {
    methods: ["post"],
    url: '/g/{group}/identity',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\GroupController::identify
* @see app/Http/Controllers/GroupController.php:80
* @route '/g/{group}/identity'
*/
identify.url = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return identify.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GroupController::identify
* @see app/Http/Controllers/GroupController.php:80
* @route '/g/{group}/identity'
*/
identify.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: identify.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GroupController::identify
* @see app/Http/Controllers/GroupController.php:80
* @route '/g/{group}/identity'
*/
const identifyForm = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: identify.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GroupController::identify
* @see app/Http/Controllers/GroupController.php:80
* @route '/g/{group}/identity'
*/
identifyForm.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: identify.url(args, options),
    method: 'post',
})

identify.form = identifyForm

/**
* @see \App\Http\Controllers\GroupController::updateSettings
* @see app/Http/Controllers/GroupController.php:105
* @route '/g/{group}/settings'
*/
export const updateSettings = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateSettings.url(args, options),
    method: 'patch',
})

updateSettings.definition = {
    methods: ["patch"],
    url: '/g/{group}/settings',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\GroupController::updateSettings
* @see app/Http/Controllers/GroupController.php:105
* @route '/g/{group}/settings'
*/
updateSettings.url = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return updateSettings.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GroupController::updateSettings
* @see app/Http/Controllers/GroupController.php:105
* @route '/g/{group}/settings'
*/
updateSettings.patch = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateSettings.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\GroupController::updateSettings
* @see app/Http/Controllers/GroupController.php:105
* @route '/g/{group}/settings'
*/
const updateSettingsForm = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateSettings.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GroupController::updateSettings
* @see app/Http/Controllers/GroupController.php:105
* @route '/g/{group}/settings'
*/
updateSettingsForm.patch = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateSettings.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateSettings.form = updateSettingsForm

const GroupController = { show, unlock, lock, identify, updateSettings }

export default GroupController