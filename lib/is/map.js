import getValueType from '../internal/getValueType.js';
/**
 * 判断是否是Map值
 * @author 陈随易 <https://chensuiyi.me>
 * @category 判断
 * @param {any} value 任意值
 * @returns {Boolean} 返回是否是Map值
 */
export default (value) => {
    return getValueType(value) === '[object Map]';
};
