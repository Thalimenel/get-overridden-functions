import { getNativeProps } from "./native"

const nativeProps = getNativeProps();

const getOverridden = () => {
    let result: string[][] = [];
    
    nativeProps.forEach(propArray => {
        let realValue = window;
        for (let i = 0; i < propArray.length; i++) {
            realValue = (realValue as any)[propArray[i]];
            if (!realValue) {
                result.push(propArray);
                return;
            }
        }
        if (!(typeof realValue === 'function' && /function \w*\(\) \{ \[native code\] \}/.test(Function.prototype.toString.call(realValue)))) {
            result.push(propArray);
        }
    });
    return result;
}



export default getOverridden;
export { getOverridden, getNativeProps }