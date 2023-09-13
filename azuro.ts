import axios from 'axios';
import { getMarketName,getMarketKey, getMarketDescription, getSelectionName } from '@azuro-org/dictionaries'
import { formatDate } from './utils';
// import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
// const url= 'https://thegraph.azuro.org/subgraphs/name/azuro-protocol/azuro-api-mumbai-dev-v3'
const url= 'https://thegraph.azuro.org/subgraphs/name/azuro-protocol/azuro-api-polygon-v3'
// const client = new ApolloClient({
//   uri:url,
//   cache: new InMemoryCache(),
// });
// client
//   const games =  gql`
//     query Games($where: Game_filter!) {
//       games(where: $where) {
//         sport {
//           name
//         }
//         league {
//           name
//           country {
//             name
//           }
//         }
//         participants {
//           name
//           image
//         }
//         startsAt
//       }
//     }
//     `
  // const game = useQuery(games, {
  //   variables: {
  //     where: {
  //       sport_: {
  //         name: 'Football',
  //       },
  //     },
  //   },
  // })
  // console.log(game)


// const GET_GAMES = gql`
// query Games {
  //   games {
  //     sport {
  //       name
  //     }
  //     league {
  //       name
  //       country {
  //         name
  //       }
  //     }
  //     participants {
  //       name
  //       image
  //     }
  //     startsAt
  //   }
  // }
// `;

// function Dogs() {
//   const { loading, error, data } = useQuery(GET_GAMES);
//   console.log(data)
// }
// const query = `
//   query GetAvailableGames {
//     games {
//       id
//       name
//       available
//     }
//   }
// `;

// const query2 =  `{
//   games(id:"0x2a838ab9b037db117576db8d0dcc3b686748ef7c_1565966713"){
//     id
//     conditions{
//       conditionId
//       coreAddress
//       game{
//         id
//       }
//       outcomes{
//         outcomeId
//         currentOdds
//       }}
  
// }
  
// }`
// axios.post(url,{query:query2})
// .then((res) => res.data.data.games)
// .then((result) => {
//   let markets:any = []
//   // console.log(result)
//   result.map((e:any)=>{
//       if (e.id =="0x2a838ab9b037db117576db8d0dcc3b686748ef7c_1565966713"){
//       e.conditions.map((u:any)=>{
//         // console.log(u)
//         u.outcomes.map((r:any)=>{
//           if (getMarketKey(r.outcomeId)=="1-1-1"){
//             if (getSelectionName(r)=="1" || getSelectionName(r)=="2" ||getSelectionName(r)=="X" ){
//               console.log(r)
//               markets.push({conditionId:u.conditionId ,outcomeId:r.outcomeId,currentodds : r.currentOdds , selection:getSelectionName(r),coreaddress:u.coreAddress})
//             }
//           }
//         })
//       })
//     }
//   }
//   )
//   return markets
// })
// 0x2a838ab9b037db117576db8d0dcc3b686748ef7c_1565966713

// const QUERY = `
//   query Games($where: Game_filter!) {
//     games(where: $where) {
//       id
//       conditions{
//         conditionId
//         coreAddress
//         game{
//           id
//         }
//         outcomes{
//           outcomeId
//           currentOdds
//         }}
//   }
//         }
    
  
// `;

// axios({
//   url:url,
//   method: 'post',
//   data: {
//     query: QUERY,
//     variables: {
//       where: {
// id:"0xe47f16bc95f4cf421f008bc5c23c1d3d5f402935_1578354258"
//       },
//     },
//   },
// })
// .then((response:any) => {
//   console.log(response.data.data.games[0].conditions[0].outcomes);
// })
// .catch((error:any) => {
//   console.error(error);
// });
// const QUERY = `
//   query Games($where: Game_filter!) {
//     games(where: $where) {
//           sport {
//               name
//             }
//             league {
//               name
//               country {
//                 name
//               }
//             }
//             participants {
//               name
//               image
//             }
//             startsAt
//           }
//         }
    
  
// `;

// axios({
//   url:url,
//   method: 'post',
//   data: {
//     query: QUERY,
//     variables: {
//       where: {
//         startsAt_gt: Math.floor(Date.now() / 1000),
//       },
//     },
//   },
// })
// .then((response:any) => {
//   console.log(response.data.data.games);
// })
// .catch((error:any) => {
//   console.error(error);
// });



async function getCondition(id:string) {
//   const query2 =  `{
//     games(id:"${id}"){
//       id
//       conditions{
//         conditionId
//         coreAddress
//         game{
//           id
//         }
//         outcomes{
//           outcomeId
//           currentOdds
//         }}
//   }
//   }`
// const res = await axios.post(url,{query:query2})
const QUERY = `
  query Games($where: Game_filter!) {
    games(where: $where) {
      id
      conditions{
        conditionId
        coreAddress
        game{
          id
        }
        outcomes{
          outcomeId
          currentOdds
        }}
  }
        }
    
  
`;

const res = await axios({
  url:url,
  method: 'post',
  data: {
    query: QUERY,
    variables: {
      where: {
id:id,
      },
    },
  },
})
.then((res) => res.data.data.games)
.then((result) => {
  let markets:any = []
  // console.log(result)
  result.map((e:any)=>{
      if (e.id ==id){
      e.conditions.map((u:any)=>{
        // console.log(u)
        u.outcomes.map((r:any)=>{
          if (getMarketKey(r.outcomeId)=="1-1-1"){
            if (getSelectionName(r)=="1" || getSelectionName(r)=="2" ||getSelectionName(r)=="X" ){
              // console.log(r)
              markets.push({conditionId:u.conditionId,outcomeId:r.outcomeId,currentodds : r.currentOdds,selection:getSelectionName(r),coreaddress:u.coreAddress})
            }
          }
        })
      })
    }
  }
  )
  console.log(markets)
  return markets
})
return res
}
async function getGames(sport:string) {
  const starts= Math.floor(Date.now() / 1000)
  // const query = `{
  //     games(sport:${sport},hasActiveConditions:true,) {
  //       sport{
  //         name
  //       }
  //           id
  //           liquidityPool
  //       gameId
  //       status
  //       startsAt
  //       league {
  //         name
  //       }
  //       participants {
  //         name
  //       }
  //       startsAt
        
  //     }
  //   }`
    let games:any =[]
  //   console.log(query)
  // const res = await axios.post(url,{query:query})
  const QUERY = `
  query Games($where: Game_filter!) {
    games(where: $where) {
      gameId
      id
          sport {
              name
            }
            league {
              name
            }
            participants {
              name
            }
            startsAt
          }
        }
    
  
`;
console.log(Math.floor(Date.now() / 1000))
const res =await axios({
  url:url,
  method: 'post',
  data: {
    query: QUERY,
    variables: {
      where: {
        startsAt_gt: Math.floor(Date.now() / 1000),
        sport_:{
          name:sport
        }
      },
    },
  },
}).then((res) => {return res.data.data.games})
      res.map((e:any)=>{
        
        // console.log(res)
        // if (e.sport.name == sport && e.status == "Created"){
          games.push(e)
        // }
      })
      console.log(games)
      return res
}
export {getGames,getCondition}
