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