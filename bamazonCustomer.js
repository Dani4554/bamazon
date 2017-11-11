//Creates an Interactive Amazon like server with a simple front-end



//Require the nessecary packages
var inquirer = require ("inquirer");
var mysql = require("mysql");



//Creates the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});

//Connects to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
	
	// run the start function after the connection is made to prompt the user
	start();

});


function start () {
	function loadProducts() {
		// Selects all of the data from the MySQL products table
		connection.query("SELECT * FROM products", function (err, res) {
			if (err) throw err;

			// Draw the table in the terminal using the response
			console.table(res);

			// Then prompt the customer for their choice of product, pass all the products to promptCustomerForItem
			promptCustomerForItem(res);
		});
	}

	// Prompt the customer for a product ID
	function promptCustomerForItem(inventory) {
		// Prompts user for what they would like to purchase
		inquirer
			.prompt([
				{
					type: "input",
					name: "choice",
					message: "What is the ID of the item you would you like to purchase? [Quit with Q]",
					validate: function (val) {
						return !isNaN(val) || val.toLowerCase() === "q";
					}
				}
			])
			.then(function (val) {
				// Check if the user wants to quit the program
				checkIfShouldExit(val.choice);
				var choiceId = parseInt(val.choice);
				var product = checkInventory(choiceId, inventory);

				// If there is a product with the id the user chose, prompt the customer for a desired quantity
				if (product) {
					// Pass the chosen product to promptCustomerForQuantity
					promptCustomerForQuantity(product);
				}
				else {
					// Otherwise let them know the item is not in the inventory, re-run loadProducts
					console.log("\nThat item is not in the inventory.");
					loadProducts();
				}
			});
	}

	// Prompt the customer for a product quantity
	function promptCustomerForQuantity(product) {
		inquirer
			.prompt([
				{
					type: "input",
					name: "quantity",
					message: "How many would you like? [Quit with Q]",
					validate: function (val) {
						return val > 0 || val.toLowerCase() === "q";
					}
				}
			])
			.then(function (val) {
				// Check if the user wants to quit the program
				checkIfShouldExit(val.quantity);
				var quantity = parseInt(val.quantity);

				// If there isn't enough of the chosen product and quantity, let the user know and re-run loadProducts
				if (quantity > product.stock_quantity) {
					console.log("\nInsufficient quantity!");
					loadProducts();
				}
				else {
					// Otherwise run makePurchase, give it the product information and desired quantity to purchase
					makePurchase(product, quantity);
				}
			});
	}

	// Purchase the desired quanity of the desired item
	function makePurchase(product, quantity) {
		connection.query(
			"UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
			[quantity, product.item_id],
			function (err, res) {
				// Let the user know the purchase was successful, re-run loadProducts
				console.log("\nSuccessfully purchased " + quantity + " " + product.product_name + "'s!");
				loadProducts();
			}
		);
	}

	// Check to see if the product the user chose exists in the inventory
	function checkInventory(choiceId, inventory) {
		for (var i = 0; i < inventory.length; i++) {
			if (inventory[i].item_id === choiceId) {
				// If a matching product is found, return the product
				return inventory[i];
			}
		}
		// Otherwise return null
		return null;
	}

	// Check to see if the user wants to quit the program
	function checkIfShouldExit(choice) {
		if (choice.toLowerCase() === "q") {
			// Log a message and exit the current node process
			console.log("Goodbye!");
			process.exit(0);
		}
	}
}
























//Functions

function displayInventory() {

	//Queries all the items in the databases and returns an array
	connection.query(
		"SELECT * FROM products",
		function(err, results) {
			if (err) throw err;

			header();
			space();

			//Logs all the results using a simple forEach
			results.forEach(function(element) {

				top();
				console.log("  		Product: " + element.product_name + "			ID: " + element.item_id);
				line();
				console.log("		Its in the " + element.department_name + " department");
				line();
				console.log("		Product price : $" + element.price);
				line();
				console.log("		How much of the product we have in stock: " + element.stock_quantity);
				space();

			});
			buy();
		}
	);

	
}	

//Main function that calls all other functions to use the inquirer data
function buy(){

	inquirer.prompt([
		
			{
				type: "input",
				name: "id",
				message: "Enter the ID of the item you would like to buy"
			},
		
			{
				type: "input",
				name: "units",
				message: "How many units of the item would you like to buy?",
			}
		
		]).then(function(data){
			
				connection.query(
        "SELECT stock_quantity, product_name FROM products WHERE ?  ", 
        [
            {
                item_id: data.id
            }
        ], 

        function(err, res) {

					if(err){
						console.log(err);
					}
					
					//Check if there is enough of the item
					if(data.units <= res[0].stock_quantity){
						console.log("\nThere is enough of the item: "+ res[0].product_name + "\n");

						//updates the table by subtracting the quantity ordered
						update(data.id, data.units, res[0].stock_quantity);

						//calculates the price for the total unit
						showPrice(data.id, data.units, res[0].product_name);

						//turns off the connection
						afterConnection();
					}
					else{
						console.log("\nThere is not enough of the item, choose again\n");
						buy();
					}
			});
			
		});	
}

function start(){
	displayInventory();
}

function update(id, units, totalStock){

	var subUnits = totalStock - units; 

	connection.query(
		"UPDATE products SET ? WHERE ?",
		[
			{
				stock_quantity: subUnits
			},
			{
				item_id: id
			}
		],
		function(error) {
			if (error) throw err;
		}
	);
}

function showPrice(id, units, product){

	connection.query(
		"SELECT price FROM products WHERE ?  ", 
		[
				{
						item_id: id
				}
		], 

		function(err, res) {

			if(err){
				console.log(err);
			}
			
			var totalPrice = res[0].price * units;
			
			console.log("\nThe total price for " + units + " " + product + "(s) is: $" + totalPrice + "\n");

	});

}

function top() {
	console.log("			//////////\\\\\\\\\\\\\\\\\\\\");
}

function space() {
	console.log("\n\n");
}

function line() {
	console.log("		------------------------------------\n");
}

function header() {
	console.log("		-----LIST OF PRODUCTS ON SALE-----");
}

function afterConnection(){
	connection.end();
}
