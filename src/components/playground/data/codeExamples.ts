export const codeExamples = {
  // ... existing examples ...
  
  processVisualizationTest: `// Process Visualization Test
// This code demonstrates different types of processes with clear timing
// Watch how each process is highlighted in the visualization

// Main function that orchestrates everything
async function main() {
  //console.log("Starting main process...");
  
  // Regular function
  function regularFunction() {
    //console.log("Regular function executing...");
    return "Regular function completed";
  }
  
  // Async function
  async function asyncFunction() {
    //console.log("Async function starting...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    //console.log("Async function completed");
    return "Async function result";
  }
  
  // Arrow function
  const arrowFunction = () => {
    //console.log("Arrow function executing...");
    return "Arrow function completed";
  };
  
  // Class with method
  class TestClass {
    constructor() {
      //console.log("TestClass constructor");
    }
    
    async classMethod() {
      //console.log("Class method starting...");
      await new Promise(resolve => setTimeout(resolve, 800));
      //console.log("Class method completed");
    }
  }
  
  // Timer functions
  setTimeout(() => {
    //console.log("setTimeout callback executing...");
  }, 500);
  
  setInterval(() => {
    //console.log("setInterval callback executing...");
  }, 1500);
  
  // Execute functions in sequence
  //console.log(regularFunction());
  await asyncFunction();
  //console.log(arrowFunction());
  
  const testInstance = new TestClass();
  await testInstance.classMethod();
  
  //console.log("Main process completed");
}

// Start the main process
main().catch(console.error);`
}; 