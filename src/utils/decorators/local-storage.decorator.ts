export function LocalStorage(idMethodeName?: string) {
  return function (proto: any, propName: string) {
    const className: string = proto.constructor.name;
    const originalComponentWillLoad: () => void = proto.componentWillLoad;
    let internalValue: any = proto[propName];
    let isInit = true;

    function getStorageKey(): string {
      const hostId: string = this[idMethodeName] ?? '';
      return hostId ? `${hostId}-${className}-${propName}` : `${className}-${propName}`;
    }

    proto.componentWillLoad = function () {
      if (originalComponentWillLoad) {
        originalComponentWillLoad.call(this);
      }

      const storedValue = localStorage.getItem(getStorageKey.call(this));

      if (storedValue !== null) {
        this[propName] = JSON.parse(storedValue);
      }

      isInit = false;
    };

    Object.defineProperty(proto, propName, {
      get() {
        return internalValue;
      },
      set(newVal) {
        internalValue = newVal;

        if (!isInit) {
          localStorage.setItem(getStorageKey.call(this), JSON.stringify(newVal));
        }
      },
      configurable: true,
      enumerable: true,
    });
  };
}
