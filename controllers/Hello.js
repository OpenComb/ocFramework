
module.exports = {

	title: "Hello World, this is OpenComb"
	, view: "opencomb/templates/Hello.html"

	, process: function(seed,nut,earth){
		return true ;
	}

	, actions: {
		say: function(seed,nut,earth)
		{
			nut.message("hello world") ;
			return true ;
		}
	}

} ;
