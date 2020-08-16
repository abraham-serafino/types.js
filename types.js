//
const checkType = expectedType => value => {
  if (expectedType === 'func') {
    if (typeof value !== 'function') {
      throw new TypeError(`Value must be a function`)
    }
  } else if (expectedType === 'array') {
    if (typeof value !== 'object' || !Array.isArray(value)) {
      throw new TypeError(`Value must be an array`)
    }
  } else if (typeof value !== expectedType) {
    if (expectedType === 'object') {
      throw new TypeError(`Value must be an object`)
    }

    throw new TypeError(`Value must be a ${expectedType}`)
  }
}

// ensure that the new object has the same shape as the old object
const enforceObjectShape = (oldValue, newValue) => {
  if (newValue === null) {
    return newValue
  }

  for (let newPropName of Object.getOwnPropertyNames(newValue)) {
    if (typeof oldValue[newPropName] === 'undefined') {
      throw new TypeError(`Invalid extra property '${newPropName}'`)
    }
  }

  for (let currentPropName of Object.getOwnPropertyNames(oldValue)) {
    const currentProp = oldValue[currentPropName]
    const newProp = newValue[currentPropName]

    if (typeof currentProp === 'function') {
      // currentProp is (and newProp should be) a function that enforces
      // a particular data type
      if (
        typeof currentProp.type === 'string' &&
        (typeof newProp !== 'function' ||
          typeof newProp.type === 'undefined' ||
          newProp.type !== currentProp.type)
      ) {
        throw new TypeError(
          `Object must have property '${currentPropName}' of type ${currentProp.type}`
        )

        // are they trying to override a function with a non-function?
      } else if (typeof newProp !== 'function') {
        if (typeof newProp !== 'undefined') {
          throw new TypeError(`'${currentPropName}' must be a function`)

          // inherit function from the original object
        } else {
          newValue[currentPropName] = currentProp.bind(newValue)
        }
      }
    }
  }

  // no exceptions? then I guess we massed muster...
  return newValue
}

// export a function that stores a value for - and enforces the type of -
// each data type
for (let currentType of ['array', 'func', 'number', 'object', 'string']) {
  module.exports[currentType] = initialValue => {
    checkType(currentType)(initialValue)

    let storedValue =
      currentType === 'object' ? Object.freeze(initialValue) : initialValue

    const varClosure = value => {
      if (typeof value !== 'undefined') {
        checkType(currentType)(value)

        if (typeof value === 'object') {
          // by preserving the shape of the original object, we can
          // allow the new object to be set to "null"
          storedValue = enforceObjectShape(initialValue, value)
        } else {
          storedValue = value
        }
      }

      return storedValue
    }

    varClosure.type = currentType
    return varClosure
  }

  module.exports[currentType].type = currentType
}

module.exports.withArgs = (argTypes, actualArgs) => {
  const actualArgsLength = actualArgs.length
  const argTypesLength = argTypes.length

  if (actualArgsLength !== argTypesLength) {
    throw new TypeError(
      `Expected ${argTypesLength} argument(s), but got ${actualArgsLength}`
    )
  }

  return argTypes.map((type, i) => type(actualArgs[i]))
}

///////////////////////////////////////////////////////
////////////    EXAMPLES                ///////////////
///////////////////////////////////////////////////////

const { array, func, number, object, string, withArgs } = module.exports

let employee = object({
  name: string('bob'),
  salary: number(15000.0),

  changeEverything (name, salary) {
    this.name(name)
    this.salary(salary)

    return this
  },

  sayHello () {
    console.log('Hello!')
  }
})

employee().changeEverything('Alice', 99000)
console.log('employee: ', employee())
console.log('employee.name: ', employee().name())
console.log('employee.salary: ', employee().salary())

const bill = func(() => employee().changeEverything('Bill', 25000))
console.log('bill: ', bill()())

function doAThing (...args) {
  console.log('This is how you enforce types in a parameter list')

  const [name, rank, getSerialNumber, alice] = withArgs(
    [string, number, func, employee],
    args
  )

  console.log(name(), rank(), getSerialNumber()(), alice)
}

doAThing('James T. Kirk', 3, () => 'NCC-1701', employee())

// Javascript's object destructuring eliminates the need for
// the "class" keyword, which is good because most people don't understand
// prototypal inheritance anyway
const secondEmployee = object({
  // you can "clone" the employee object, as long as the new object has the same
  // shape as the original
  ...employee({
    name: string('bill'),
    salary: number(85000),
    changeEverything () {} // optionally override method
  }),

  // properties can be added here...
  age: number(73)
})

// ... but not here
// employee().age = 73 // throws an exception
console.log(secondEmployee())

secondEmployee().sayHello() // implicitly inherited method

// employee is nullable, but non-null values will still be
// checked against the original shape of the object
employee(null)

// employee('some random value') // throws an exception

// What about typed arrays and generic typing?

// If you need generics or other common design patterns such as singleton,
// decorator, factory method, and even dependency injection patterns, then you
// should seriously consider learning how to take full advantage of Javascript's
// functional, dynamically-typed features, instead.

// (I do support arrays, though - just not "typed" ones):
const listOfValues = array(['Alice', 17.9, null, false])
console.log(listOfValues()[1])
