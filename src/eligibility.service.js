class EligibilityService {
  /**
   * Check if cart value is equal to criteria value.
   *
   * @param cartValue
   * @param criteriaValue
   * @return {Array<boolean>}
   */

  equals(cartValue, criteriaValue) {
    let array = [];
    if (typeof cartValue === "object") {
      for (let element of cartValue) {
        array.push(element == criteriaValue);
      }
    } else {
      array.push(cartValue == criteriaValue);
    }
    return array;
  }
  /**
   * Check if cart value is greater than criteria value.
   *
   * @param cartValue
   * @param criteriaValue
   * @return {boolean}
   */
  gt(cartValue, criteriaValue) {
    return cartValue > criteriaValue;
  }
  /**
   * Check if cart value is lesser than criteria value.
   *
   * @param cartValue
   * @param criteriaValue
   * @return {boolean}
   */
  lt(cartValue, criteriaValue) {
    return cartValue < criteriaValue;
  }
  /**
   * Check if cart value is greater than  or equal to criteria value.
   *
   * @param cartValue
   * @param criteriaValue
   * @return {boolean}
   */
  gte(cartValue, criteriaValue) {
    return cartValue >= criteriaValue;
  }
  /**
   * Check if cart value is lesser than or equal to criteria value.
   *
   * @param cartValue
   * @param criteriaValue
   * @return {boolean}
   */
  lte(cartValue, criteriaValue) {
    return cartValue <= criteriaValue;
  }
  /**
   * Get result of all conditions of "AND" and "OR" object
   *
   * @param cartValue
   * @param criteriaValue
   * @param key
   * @return {Array<boolean>}
   */
  andOr(cart, criteria, key, subKey) {
    // check if and conditions has a at least two conditions
    const keysOfAndCondition = Object.keys(criteria[key][subKey]);
    if (keysOfAndCondition.length < 2) {
      return false;
    }
    let cartValue = cart[key];
    const andOrObject = criteria[key][subKey];
    let arr = [];
    if (key == "date") {
      cartValue = new Date(cartValue).getTime();
      if (andOrObject.gt) andOrObject.gt = new Date(andOrObject.gt).getTime();
      if (andOrObject.gte)
        andOrObject.gte = new Date(andOrObject.gte).getTime();
      if (andOrObject.lt) andOrObject.lt = new Date(andOrObject.lt).getTime();
      if (andOrObject.lte)
        andOrObject.lte = new Date(andOrObject.lte).getTime();
    }
    for (const key1 in andOrObject) {
      const criteriaValue = andOrObject[key1];
      switch (key1) {
        case "lt":
          arr.push(this.lt(cartValue, criteriaValue));
          break;
        case "gte":
          arr.push(this.gte(cartValue, criteriaValue));
          break;
        case "lte":
          arr.push(this.lte(cartValue, criteriaValue));
          break;
        case "gt":
          arr.push(this.gt(cartValue, criteriaValue));
          break;
      }
    }
    return arr;
  }
  /**
   * Compare cart data with criteria to compute eligibility.
   * If all criteria are fulfilled then the cart is eligible (return true).
   *
   * @param cart
   * @param criteria
   * @return {boolean}
   */
  isEligible(cart, criteria) {
    for (let key in criteria) {
      let cartVal = cart[key];
      try {
        if (key.indexOf(".") !== -1) {
          const arrayOfKeys = key.split(".");

          cartVal = cart[arrayOfKeys[0]];
          if (cartVal.map) {
            cartVal = cartVal.map((item) => item[arrayOfKeys[1]]);
          } else {
            cartVal = cartVal[arrayOfKeys[1]];
          }
        }
      } catch {
        return false;
      }
      if (
        typeof criteria[key] == "string" ||
        typeof criteria[key] == "number"
      ) {
        const equalCondtion = this.equals(cartVal, criteria[key]);
        if (equalCondtion.includes(true) === false) {
          return false;
        }
      } else if (typeof criteria[key] == "object") {
        let criteriaSubKey = Object.keys(criteria[key])[0];
        switch (criteriaSubKey) {
          case "gt":
            const greaterThanCondtion = this.gt(
              cartVal,
              criteria[key][criteriaSubKey]
            );
            if (!greaterThanCondtion) {
              return false;
            }
            break;
          case "lt":
            const lesserThanCondtion = this.lt(
              cartVal,
              criteria[key][criteriaSubKey]
            );
            if (!lesserThanCondtion) {
              return false;
            }
            break;
          case "gte":
            const greaterThanOrEqualToCondtion = this.gte(
              cartVal,
              criteria[key][criteriaSubKey]
            );
            if (!greaterThanOrEqualToCondtion) {
              return false;
            }
            break;
          case "lte":
            const lesserThanOrEqualToCondtion = this.lte(
              cartVal,
              criteria[key][criteriaSubKey]
            );
            if (!lesserThanOrEqualToCondtion) {
              return false;
            }
            break;
          case "and":
            const andConditionResult = this.andOr(
              cart,
              criteria,
              key,
              criteriaSubKey
            );
            if (
              typeof andConditionResult === "boolean" ||
              andConditionResult.includes(false)
            ) {
              return false;
            }
            break;
          case "or":
            const orConditionResult = this.andOr(
              cart,
              criteria,
              key,
              criteriaSubKey
            );
            if (
              typeof orConditionResult === "boolean" ||
              orConditionResult.includes(true) === false
            ) {
              return false;
            }
            break;
          case "in":
            let arrayOfKeys;
            let cartValue;
            let inCondition;
            if (key.indexOf(".") !== -1) {
              arrayOfKeys = key.split(".");
              cartValue = cart[arrayOfKeys[0]].map(
                (item) => item[arrayOfKeys[1]]
              );
              inCondition = cartValue.some((item) =>
                criteria[key][criteriaSubKey].includes(item)
              );
            } else {
              inCondition = criteria[key][criteriaSubKey].includes(cartVal);
            }
            if (!inCondition) {
              return false;
            }
            break;
        }
      }
    }
    return true;
  }
}

module.exports = {
  EligibilityService,
};
