const DAO = require('../DAOManager').queries,
  Models = require('../Models');
Config = require('../Config');
ERROR = Config.responseMessages.ERROR;



const createEvent = async (payload) => {
  //    console.log(payload);
  const { venue, startTime, endingTime } = payload;
  let query = {
    venue,
  }
  let res = await DAO.getDataOne(Models.party, query, {}, {})
  console.log(res);
  // if (res!= null) {
  //   console.log("hi");
  //   if (venue == res.venue) {
  //     console.log("hello");
  //     if (startTime.getTime() >= res.startTime.getTime()&& startTime.getTime() <= res.endingTime.getTime()||
  //         endingTime.getTime()>=res.startTime.getTime()&& endingTime.getTime()<=res.endingTime.getTime()||
  //         res.startTime.getTime()>=startTime.getTime()&&res.startTime.getTime()<=endingTime.getTime()) {
  //         console.log("hey");
  //         throw "fas gye aap";
  //       }
  //     }
  //   }

  let final = await DAO.saveData(Models.party, payload);

  return {
    final
  }
}

const searchEvent = async (payload) => {
  let res= await Models.party.find( { loc :
    {
$nearSphere: {
$geometry: {
type : "Point",
coordinates : [-73.97,40.77 ]
},
$minDistance: 1000,
$maxDistance: 80000
}
}
},{_id:1,name:1},{})

  // let res = await DAO.getData(Models.party, 
  //   {
  //     loc:
  //     {
  //       $nearSphere: {
  //         $geometry: {
  //           type: "Point",
  //           coordinates: [-73.97, 40.77]
  //         },
  //         $minDistance: 1000,
  //         $maxDistance: 80000
  //       }
  //     }
  //   }

  // , {_id:1,name:1},{});
  

  return {
    res
  }
}

module.exports = {
  createEvent,
  searchEvent

}
