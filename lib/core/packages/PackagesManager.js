var Package = require("./Package.js") ;
var utilarr = require("../../util/array.js") ;

module.exports = function(){

	this.root = new Package ;
	this.assertLookups = {

		controller: [
			// 省略 package 根目录下的 'lib'
			function(pkg,innerpath){
				return pkg.folder + '/lib/' + innerpath ;
			}
		]

		, template: [
			// 省略 package 根目录下的 'tempates'
			function(pkg,innerpath){
				return pkg.folder + '/templates/' + innerpath ;
			}
		]
	}

}

function createModNotFoundError (path){
    var err = new Error("Cannot find module: '"+path+"'") ;
    err.code = 'MODULE_NOT_FOUND' ;
    return err ;
}


module.exports.prototype.resolve = function(path,from,type)
{
	if(!path)
	{
		throw new Error("missing path") ;
	}
	if(typeof path!='string')
	{
		throw new Error("path must be a string")
	}

	// 绝对路径
	if(path[0]=='/')
	{
		return require.resolve(path) ;
	}

	// 相对路径
	else
	{
		if( path.substr(0,2)=='./' || path.substr(0,3)=='../' )
		{
			path = (from?(from+"/"):'') + path ;
			return require.resolve(path) ;
		}

		else
		{
            var arr = Package.firstSlide(path) ;

            if(from)
            {
                var frompkg = this.root.locate(from) ;
                if(!frompkg)
                {
                    throw createModNotFoundError(path) ;
                }
                var pkg = frompkg.dep(arr[0]) ;
            }
            else
            {
                var pkg = this.root.inners[arr[0]] || this.root.name==arr[0] && this.root ;
            }

            if(!pkg)
            {
                throw createModNotFoundError(path) ;
            }

            return this.assertResolve(pkg,arr[1]||'',type) ;
		}
	}
}

module.exports.prototype.assertResolve = function(pkg,innerpath,type)
{
    var fullpath = pkg.folder + '/' + innerpath ;
    var err ;

    try{
        return require.resolve(fullpath) ;
    }catch(e){
        if(e.code!="MODULE_NOT_FOUND" )
        {
            throw e ;
        }
        err = e ;
    }

	if(this.assertLookups[type])
	{
		for(var i=0;i<this.assertLookups[type].length;i++)
		{
			var path = this.assertLookups[type][i](pkg,innerpath) ;

			try{
				return require.resolve(path ) ;
			}catch(e){
				if(e.code!="MODULE_NOT_FOUND")
				{
					throw e ;
				}
			}
		}
	}

    throw createModNotFoundError(innerpath) ;
}


module.exports.prototype.eachPackage = function(func,_parent)
{
    _parent || (_parent=this.root) ;

    func(_parent) ;

    var inners = [] ;
    for(var name in _parent.inners)
    {
        if( utilarr.search(inners,_parent.inners[name])===false )
        {
            inners.push(_parent.inners[name]) ;

            //
            this.eachPackage(func,_parent.inners[name]) ;
        }
    }
}