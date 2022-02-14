const isPrototypeOk = (func: Function) => {
    return !!(func.prototype && Object.keys(func.prototype).find(key => key !== 'constructor'));
}

const isNotWindowOrDocument = (obj: any) => {
    let toReturn = false;

    let objectProtTostring = Object.prototype.toString.call(obj);
    if (obj instanceof Window || objectProtTostring === '[object Window]') {
        toReturn = true;
    }
    if (obj instanceof Document || /\[object \w*Document\]/.test(objectProtTostring) || obj instanceof Node) {
        toReturn = true;
    }
    return toReturn;
}

const goThroughProps = (obj: any, doPrototype = false, cache: Set<any>) => {
    let props: string[][] = []
    let keys = Object.getOwnPropertyNames(obj);
    keys.forEach(key => {
        let value;
        let descriptor = Object.getOwnPropertyDescriptor(obj, key);
        if (descriptor && !descriptor.get) {
            value = obj[key];
            if (!cache.has(value)) {
                if (typeof value === 'function') {
                    props.push([key])
                    if (doPrototype && isPrototypeOk(value)) {
                        let subProps = goThroughProps(value.prototype, false, cache);
                        if (subProps.length > 0) {
                            subProps = subProps.map(propArray => [key, 'prototype', ...propArray]);
                            props.push(...subProps);
                        }
                    }
                }
                else if (value && typeof value === 'object' && !isNotWindowOrDocument(value)) {
                    let subProps = goThroughProps(value, false, cache);
                    if (subProps.length > 0) {
                        subProps = subProps.map(propArray => [key, ...propArray]);
                        props.push(...subProps);
                    }
                }
                cache.add(value);
            }
        }
    });
    return props;
}

const createIframe = () => {
    let iframe;
    try {
        iframe = document.createElement('iframe');
        document.head.appendChild(iframe);
    }
    catch (err) {
        document.head.insertAdjacentHTML('beforeend', `<iframe id="csta-iframe"></iframe>`)
        iframe = document.querySelector('iframe#csta-iframe') as HTMLIFrameElement
    }
    return iframe;
}

const getNativeProps = () => {
    let iframe = createIframe();
    const cleanWindow = iframe.contentWindow;

    const cache = new Set();

    let props: string[][] = []

    if (cleanWindow) {
        props = goThroughProps(cleanWindow, true, cache);

    }
    iframe.remove();
    return props;

}

export { getNativeProps }