class Person {
  constructor(private name: string) {
    this.name = name;
  }
  logName() {
    console.log(this.name);
  }
}

const person = new Person('Jesse Ajioh');

function test(cb: () => void) {
  console.log('Calling callback from test function');
  cb();
}

test(() => person.logName());
