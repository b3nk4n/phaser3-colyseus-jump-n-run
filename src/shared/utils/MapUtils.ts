export default class MapUtils {
    public static computeIfAbsent<K, V>(map: Map<K, V>, key: K, mappingFunction: (key: K) => V): V {
        let val = map.get(key);
        if (val === undefined) {
            val = mappingFunction(key);
            map.set(key, val);
        }
        return val;
    }
}
