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
