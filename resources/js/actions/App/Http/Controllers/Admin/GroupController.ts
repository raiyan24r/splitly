import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\GroupController::index
* @see app/Http/Controllers/Admin/GroupController.php:23
* @route '/admin/groups'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/groups',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\GroupController::index
* @see app/Http/Controllers/Admin/GroupController.php:23
* @route '/admin/groups'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GroupController::index
* @see app/Http/Controllers/Admin/GroupController.php:23
* @route '/admin/groups'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::index
* @see app/Http/Controllers/Admin/GroupController.php:23
* @route '/admin/groups'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::index
* @see app/Http/Controllers/Admin/GroupController.php:23
* @route '/admin/groups'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::index
* @see app/Http/Controllers/Admin/GroupController.php:23
* @route '/admin/groups'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::index
* @see app/Http/Controllers/Admin/GroupController.php:23
* @route '/admin/groups'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Admin\GroupController::store
* @see app/Http/Controllers/Admin/GroupController.php:54
* @route '/admin/groups'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/groups',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\GroupController::store
* @see app/Http/Controllers/Admin/GroupController.php:54
* @route '/admin/groups'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GroupController::store
* @see app/Http/Controllers/Admin/GroupController.php:54
* @route '/admin/groups'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::store
* @see app/Http/Controllers/Admin/GroupController.php:54
* @route '/admin/groups'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::store
* @see app/Http/Controllers/Admin/GroupController.php:54
* @route '/admin/groups'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\GroupController::show
* @see app/Http/Controllers/Admin/GroupController.php:96
* @route '/admin/groups/{group}'
*/
export const show = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/groups/{group}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\GroupController::show
* @see app/Http/Controllers/Admin/GroupController.php:96
* @route '/admin/groups/{group}'
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
* @see \App\Http\Controllers\Admin\GroupController::show
* @see app/Http/Controllers/Admin/GroupController.php:96
* @route '/admin/groups/{group}'
*/
show.get = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::show
* @see app/Http/Controllers/Admin/GroupController.php:96
* @route '/admin/groups/{group}'
*/
show.head = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::show
* @see app/Http/Controllers/Admin/GroupController.php:96
* @route '/admin/groups/{group}'
*/
const showForm = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::show
* @see app/Http/Controllers/Admin/GroupController.php:96
* @route '/admin/groups/{group}'
*/
showForm.get = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::show
* @see app/Http/Controllers/Admin/GroupController.php:96
* @route '/admin/groups/{group}'
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
* @see \App\Http\Controllers\Admin\GroupController::update
* @see app/Http/Controllers/Admin/GroupController.php:138
* @route '/admin/groups/{group}'
*/
export const update = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/admin/groups/{group}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\GroupController::update
* @see app/Http/Controllers/Admin/GroupController.php:138
* @route '/admin/groups/{group}'
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
* @see \App\Http\Controllers\Admin\GroupController::update
* @see app/Http/Controllers/Admin/GroupController.php:138
* @route '/admin/groups/{group}'
*/
update.patch = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::update
* @see app/Http/Controllers/Admin/GroupController.php:138
* @route '/admin/groups/{group}'
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
* @see \App\Http\Controllers\Admin\GroupController::update
* @see app/Http/Controllers/Admin/GroupController.php:138
* @route '/admin/groups/{group}'
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

/**
* @see \App\Http\Controllers\Admin\GroupController::password
* @see app/Http/Controllers/Admin/GroupController.php:166
* @route '/admin/groups/{group}/password'
*/
export const password = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: password.url(args, options),
    method: 'put',
})

password.definition = {
    methods: ["put"],
    url: '/admin/groups/{group}/password',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\GroupController::password
* @see app/Http/Controllers/Admin/GroupController.php:166
* @route '/admin/groups/{group}/password'
*/
password.url = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return password.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GroupController::password
* @see app/Http/Controllers/Admin/GroupController.php:166
* @route '/admin/groups/{group}/password'
*/
password.put = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: password.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::password
* @see app/Http/Controllers/Admin/GroupController.php:166
* @route '/admin/groups/{group}/password'
*/
const passwordForm = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: password.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::password
* @see app/Http/Controllers/Admin/GroupController.php:166
* @route '/admin/groups/{group}/password'
*/
passwordForm.put = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: password.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

password.form = passwordForm

/**
* @see \App\Http\Controllers\Admin\GroupController::regenerateSlug
* @see app/Http/Controllers/Admin/GroupController.php:179
* @route '/admin/groups/{group}/regenerate-link'
*/
export const regenerateSlug = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateSlug.url(args, options),
    method: 'post',
})

regenerateSlug.definition = {
    methods: ["post"],
    url: '/admin/groups/{group}/regenerate-link',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\GroupController::regenerateSlug
* @see app/Http/Controllers/Admin/GroupController.php:179
* @route '/admin/groups/{group}/regenerate-link'
*/
regenerateSlug.url = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return regenerateSlug.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GroupController::regenerateSlug
* @see app/Http/Controllers/Admin/GroupController.php:179
* @route '/admin/groups/{group}/regenerate-link'
*/
regenerateSlug.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateSlug.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::regenerateSlug
* @see app/Http/Controllers/Admin/GroupController.php:179
* @route '/admin/groups/{group}/regenerate-link'
*/
const regenerateSlugForm = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerateSlug.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::regenerateSlug
* @see app/Http/Controllers/Admin/GroupController.php:179
* @route '/admin/groups/{group}/regenerate-link'
*/
regenerateSlugForm.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerateSlug.url(args, options),
    method: 'post',
})

regenerateSlug.form = regenerateSlugForm

/**
* @see \App\Http\Controllers\Admin\GroupController::archive
* @see app/Http/Controllers/Admin/GroupController.php:194
* @route '/admin/groups/{group}/archive'
*/
export const archive = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: archive.url(args, options),
    method: 'post',
})

archive.definition = {
    methods: ["post"],
    url: '/admin/groups/{group}/archive',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\GroupController::archive
* @see app/Http/Controllers/Admin/GroupController.php:194
* @route '/admin/groups/{group}/archive'
*/
archive.url = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return archive.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GroupController::archive
* @see app/Http/Controllers/Admin/GroupController.php:194
* @route '/admin/groups/{group}/archive'
*/
archive.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: archive.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::archive
* @see app/Http/Controllers/Admin/GroupController.php:194
* @route '/admin/groups/{group}/archive'
*/
const archiveForm = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: archive.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::archive
* @see app/Http/Controllers/Admin/GroupController.php:194
* @route '/admin/groups/{group}/archive'
*/
archiveForm.post = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: archive.url(args, options),
    method: 'post',
})

archive.form = archiveForm

/**
* @see \App\Http\Controllers\Admin\GroupController::destroy
* @see app/Http/Controllers/Admin/GroupController.php:209
* @route '/admin/groups/{group}'
*/
export const destroy = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/groups/{group}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\GroupController::destroy
* @see app/Http/Controllers/Admin/GroupController.php:209
* @route '/admin/groups/{group}'
*/
destroy.url = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GroupController::destroy
* @see app/Http/Controllers/Admin/GroupController.php:209
* @route '/admin/groups/{group}'
*/
destroy.delete = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::destroy
* @see app/Http/Controllers/Admin/GroupController.php:209
* @route '/admin/groups/{group}'
*/
const destroyForm = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\GroupController::destroy
* @see app/Http/Controllers/Admin/GroupController.php:209
* @route '/admin/groups/{group}'
*/
destroyForm.delete = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const GroupController = { index, store, show, update, password, regenerateSlug, archive, destroy }

export default GroupController