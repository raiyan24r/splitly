import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import expenses from './expenses'
import members from './members'
import settings from './settings'
import comments from './comments'
import payments from './payments'
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
* @see \App\Http\Controllers\GroupController::identity
* @see app/Http/Controllers/GroupController.php:80
* @route '/g/{group}/identity'
*/
export const identity = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: identity.url(args, options),
    method: 'post',
})

identity.definition = {
    methods: ["post"],
    url: '/g/{group}/identity',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\GroupController::identity
* @see app/Http/Controllers/GroupController.php:80
* @route '/g/{group}/identity'
*/
identity.url = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return identity.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GroupController::identity
* @see app/Http/Controllers/GroupController.php:80
* @route '/g/{group}/identity'
*/
identity.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: identity.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GroupController::identity
* @see app/Http/Controllers/GroupController.php:80
* @route '/g/{group}/identity'
*/
const identityForm = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: identity.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GroupController::identity
* @see app/Http/Controllers/GroupController.php:80
* @route '/g/{group}/identity'
*/
identityForm.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: identity.url(args, options),
    method: 'post',
})

identity.form = identityForm

/**
* @see \App\Http\Controllers\ExportController::__invoke
* @see app/Http/Controllers/ExportController.php:17
* @route '/g/{group}/export.csv'
*/
export const exportMethod = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/g/{group}/export.csv',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ExportController::__invoke
* @see app/Http/Controllers/ExportController.php:17
* @route '/g/{group}/export.csv'
*/
exportMethod.url = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return exportMethod.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ExportController::__invoke
* @see app/Http/Controllers/ExportController.php:17
* @route '/g/{group}/export.csv'
*/
exportMethod.get = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExportController::__invoke
* @see app/Http/Controllers/ExportController.php:17
* @route '/g/{group}/export.csv'
*/
exportMethod.head = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ExportController::__invoke
* @see app/Http/Controllers/ExportController.php:17
* @route '/g/{group}/export.csv'
*/
const exportMethodForm = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExportController::__invoke
* @see app/Http/Controllers/ExportController.php:17
* @route '/g/{group}/export.csv'
*/
exportMethodForm.get = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExportController::__invoke
* @see app/Http/Controllers/ExportController.php:17
* @route '/g/{group}/export.csv'
*/
exportMethodForm.head = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportMethod.form = exportMethodForm

const groups = {
    show: Object.assign(show, show),
    unlock: Object.assign(unlock, unlock),
    lock: Object.assign(lock, lock),
    identity: Object.assign(identity, identity),
    expenses: Object.assign(expenses, expenses),
    export: Object.assign(exportMethod, exportMethod),
    members: Object.assign(members, members),
    settings: Object.assign(settings, settings),
    comments: Object.assign(comments, comments),
    payments: Object.assign(payments, payments),
}

export default groups