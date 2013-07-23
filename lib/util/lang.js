// @private
// push the giving `array` to the end of `append`, and make sure every element is unique
exports.pushUnique = function (append, array){
    array = Array.isArray(array) ? array : [array];

    var push = Array.prototype.push,
        length = array.length,
        j, k,
        append_length,
        unique,
        member;
                
    for(k = 0; k < length; k ++){
        // append.length is ever changing
        append_length = append.length;
        member = array[k];
        unique = true;
        
        for(j = 0; j < append_length; j ++){
            if(member === append[j]){
                unique = false;
                break;
            }
        }
        
        // make sure, all found members are unique
        if(unique){
        
            // use `push.call(append, member)` instead of `append.push(member)`
            // append might be array-like objects
            push.call(append, member);
        }
    }
    
    return append;
};


// var obj = {a: {b: 2 }}
// obj, 'a.b' -> 2
exports.object_member_by_namespaces = function (obj, namespaces, default_value){
    var splitted = namespaces.split('.');
    var value = obj;

    splitted.some(function(ns) {
        if(ns in value){
            value = value[ns];
        }else{
            value = null;
            return true;
        }
    });

    return value || default_value;
};


/**
 * copy all properties in the supplier to the receiver
 * @param r {Object} receiver
 * @param s {Object} supplier
 * @param or {boolean=} whether override the existing property in the receiver
 * @param cl {(Array.<string>)=} copy list, an array of selected properties
 */
// exports.mix = function(r, s, or, cl) {
//     if (!s || !r){
//         return r;
//     }

//     var i = 0, c, len;

//     or = or || or === undefined;

//     if (cl && (len = cl.length)) {
//         for (; i < len; i++) {
//             c = cl[i];
//             if ( (c in s) && (or || !(c in r) ) ) {
//                 r[c] = s[c];
//             }
//         }
//     } else {
//         for (c in s) {
//             if (or || !(c in r)) {
//                 r[c] = s[c];
//             }
//         }
//     }
//     return r;
// };
