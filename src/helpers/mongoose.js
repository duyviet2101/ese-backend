import { Types } from 'mongoose';

export const updateNestedObjectParser = (nestedUpdateObject) => {
  const final = {

  }
  Object.keys(nestedUpdateObject).forEach(k => {
    if (typeof nestedUpdateObject[k] === 'object' && !Array.isArray(nestedUpdateObject[k]) && !Types.ObjectId.isValid(nestedUpdateObject[k])) {
      const res = updateNestedObjectParser(nestedUpdateObject[k])
      Object.keys(res).forEach(a => {
        final[`${k}.${a}`] = res[a]
      })
    }
    else
      final[k] = nestedUpdateObject[k]
  })
  return final
}