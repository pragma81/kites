export class BaseError {
 protected name :string = 'BaseError'
 protected message :string 
 protected stack :string
 prototype: Error;

 constructor(message: string, error:Error){
     this.message = message;
     this.stack = error.stack;
    }
}

