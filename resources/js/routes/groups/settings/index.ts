import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\GroupController::update
* @see app/Http/Controllers/GroupController.php:105
* @route '/g/{group}/settings'
*/
export const update = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/g/{group}/settings',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\GroupController::update
* @see app/Http/Controllers/GroupController.php:105
* @route '/g/{group}/settings'
*/
update.url = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GroupController::update
* @see app/Http/Controllers/GroupController.php:105
* @route '/g/{group}/settings'
*/
update.patch = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\GroupController::update
* @see app/Http/Controllers/GroupController.php:105
* @route '/g/{group}/settings'
*/
const updateForm = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GroupController::update
* @see app/Http/Controllers/GroupController.php:105
* @route '/g/{group}/settings'
*/
updateForm.patch = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const settings = {
    update: Object.assign(update, update),
}

export default settings