// Copyright (c) 2014 International Aid Transparency Initiative (IATI)
// Licensed under the MIT license whose full text can be found at http://opensource.org/licenses/MIT


var view_act=exports;
exports.name="view_act";

var ctrack=require("./ctrack.js")
var plate=require("./plate.js")
var iati=require("./iati.js")
var fetcher=require("./fetcher.js")

var dflat=require("../../dflat/js/dflat.js")
var dflat_savi=require("../../dflat/js/savi.js")

var refry=require("../../dstore/js/refry.js")

// the chunk names this view will fill with new data
view_act.chunks=[
	"act",
];

// called on view display to fix html in place
view_act.fixup=function()
{
	dflat_savi.fixup()
}

//
// display the view
//
view_act.view=function(args)
{
	view_act.chunks.forEach(function(n){ctrack.chunk(n,"{spinner}");});
	ctrack.setcrumb(3);
	ctrack.change_hash();
	view_act.ajax({
		aid:ctrack.hash.aid,
		lat:ctrack.hash.lat,
		lng:ctrack.hash.lng,
		country:ctrack.hash.country,
		publisher:ctrack.hash.publisher,
	});
};

//
// Perform ajax call to get data
//
view_act.ajax=function(args)
{
	args=args || {};
    
	var dat={
			"select":"jml",
			"from":"act,jml",
			"distincton":"aid",
			"aid":args.aid,
		};


	if(!dat.aid) // only filter when not asking for a single aid
	{
		if(args.lat)
		{
			dat.location_latitude_gt=Number(args.lat)-0.001;
			dat.location_latitude_lt=Number(args.lat)+0.001;
		}
		if(args.lng)
		{
			dat.location_longitude_gt=Number(args.lng)-0.001;
			dat.location_longitude_lt=Number(args.lng)+0.001;
		}
		fetcher.ajax_dat_fix(dat,args);
	}
	
	fetcher.ajax(dat,args.callback || function(data)
	{
//		console.log("view_act.numof_callback");
//		console.log(data);
			
		if(data["rows"][0])
		{
			var aa=[];
			for(var i=0;i<data.rows.length;i++)
			{

				var jml={ 0:"iati-activities" , 1:JSON.parse( data["rows"][i].jml ) }
				var iati=dflat.xml_to_xson( jml )

				dflat.clean(iati) // clean this data
				
				dflat_savi.prepare(iati) // prepare for display

				dflat_savi.chunks.iati=iati
				dflat_savi.chunks.origin=ctrack.origin

				var dd=dflat_savi.plate('<div>{iati./iati-activities/iati-activity:iati-activity||}</div>') // activity
				
				aa.push(dd)

			}
			ctrack.chunk("xml", aa.join("") );
		}
		else
		{
			ctrack.chunk("xml","{missing_data}");
		}
				
		ctrack.display(); // every fetcher.ajax must call display once
	});
}
