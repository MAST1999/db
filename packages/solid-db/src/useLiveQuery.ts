import { compileQuery, queryBuilder } from "@tanstack/db"
import { createEffect, createMemo } from "solid-js"
import { useStore } from "@tanstack/solid-store"
import type { Accessor } from "solid-js"
import type {
  Collection,
  Context,
  InitialQueryBuilder,
  QueryBuilder,
  ResultsFromContext,
  Schema,
} from "@tanstack/db"

export interface UseLiveQueryReturn<T extends object> {
  state: Accessor<Map<string, T>>
  data: Accessor<Array<T>>
  collection: Accessor<Collection<T>>
}

export function useLiveQuery<
  TResultContext extends Context<Schema> = Context<Schema>,
>(
  queryFn: (
    q: InitialQueryBuilder<Context<Schema>>
  ) => QueryBuilder<TResultContext>
): UseLiveQueryReturn<ResultsFromContext<TResultContext>> {
  const compiledQuery = createMemo(
    () => {
      const query = queryFn(queryBuilder())
      const compiled = compileQuery(query)
      compiled.start()
      return compiled
    },
    undefined,
    { name: `CompiledQueryMemo` }
  )

  const state = () => useStore(compiledQuery().results.derivedState)()
  const data = () => useStore(compiledQuery().results.derivedArray)()

  // Clean up on unmount
  createEffect(
    () => {
      const c = compiledQuery()

      return () => {
        c.stop()
      }
    },
    undefined,
    { name: `ResetQueryEffect` }
  )

  const collection = createMemo(() => compiledQuery().results, undefined, {
    name: `CollectionMemo`,
  })

  return {
    state,
    data,
    collection,
  }
}
