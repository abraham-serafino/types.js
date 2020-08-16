# types.js
Run-time type enforcement for Javascript

Typescript is great, but it is also object-oriented, which discourages newcomers from taking advantage of Javascript's functional features.
One advantage of Typescript is compile-time type checking.

One disadvantage is that Typescript does no type checking at run time, which means that rules you thought were going to be enforced at certain times, aren't.
Especially if you interact with third party vanillaJS libraries or exchange data with servers.

types.js enforces strong typing at run time, and has a mechanism for creating objects which can subsequently be cloned and extended, in the spirit of Javascript's native prototypal inheritance (minus the headaches caused by the prototype chain's unintuitive behavior).

The only down side of run-time-only enforcement is the potential for it to become resource-heavy if you are not careful.

See types.js for the library and examples; and, as always, feel free to reuse and modify in your own projects.
