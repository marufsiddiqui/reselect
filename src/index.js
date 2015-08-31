function defaultValuesEqual(a, b) {
    return a === b;
}

// TODO: Reintroduce comment about cache size, slightly rewritten
export function defaultMemoize(func, valuesEqual = defaultValuesEqual) {
    let lastArgs = null;
    let lastResult = null;
    return (...args) => {
        if (lastArgs !== null &&
            args.every((value, index) => valuesEqual(value, lastArgs[index]))) {
            return lastResult;
        }
        lastArgs = args;
        lastResult = func(...args);
        return lastResult;
    };
}

export function createSelectorCreator(memoize, ...memoizeOptions) {
    return (...funcs) => {
        let memoizedResultFunc;
        const resultFunc = funcs.pop();
        const dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs;

        function selector(state, props, ...args) {
            const params = dependencies.map(
                dependency => dependency(state, props, ...args)
            );
            return memoizedResultFunc(...params);
        }

        memoizedResultFunc = memoize(
            (...args) => {
                selector.recomputes++;
                return resultFunc(...args);
            },
            ...memoizeOptions
        );

        selector.recomputes = 0;
        return selector;
    };
}

export function createSelector(...args) {
    return createSelectorCreator(defaultMemoize)(...args);
}
