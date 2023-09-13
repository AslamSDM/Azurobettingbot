import TelegramBot, { InlineKeyboardButton,Message } from "node-telegram-bot-api";
import { ethers, Wallet, HDNodeWallet, Contract, parseEther ,formatEther} from "ethers";
import axios from "axios";
import "dotenv/config";
import db from "./dbconnect";
import Users from "./userschema";
import { getCondition, getGames } from "./azuro";
import { chunkArray, formatDate, padString } from "./utils";
import { lpabi } from "./lpV2abi";
import { erc20abi } from "./erc20abi";

const polygon = `https://polygon-mainnet.g.alchemy.com/v2/${process.env.APIKEY}`
const provider = new ethers.JsonRpcProvider(polygon)
const token: any = process.env.KEY;
console.log(token)
const bot = new TelegramBot(token, { polling: true });

// const USDTaddr = "0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832"
const USDTaddr = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
let USDTcontr:Contract
let lpaddr =""
let chatId = 0;
let wallet: Wallet | HDNodeWallet;
let balance:any;
let message = ""
let selectedsport= ""
let games:any = []
let betamnt = ""
let inputamnt = ""
let options:any = []
let selection = ""
let outcomeID = ""
let conditionID = ""
let odds:any
let selectedgame:any
let Outcomes:any 
let lp:Contract

const sports = ["Football","Baseball","MMA","Boxing","American Football"]
let opt:any = sports.map((u)=>{
    const line = [{text:u,callback_data:u}]
    return line
})

bot.onText(/\/start/,async(msg)=>{
    await db()
    console.log(opt)
    chatId = msg.chat.id;
    const userexist: any = await (Users.find({ userid: msg.from?.username }));
    message += "Welcome to betting bot \n"
    message += "\n"

    if (userexist.length > 0) {
        wallet = new ethers.Wallet((userexist[0].PrivateKey), provider)
    } else {
        wallet = ethers.Wallet.createRandom()
        const user = new Users({
            userid: msg.from?.username,
            chatID: msg.chat.id,
            address: (wallet.address),
            PrivateKey: (wallet.privateKey)
        })
        await user.save()
    }
    const waladr = await wallet.address
    USDTcontr = new ethers.Contract(USDTaddr,erc20abi,wallet)
    const maticbalance = formatEther(String(await provider.getBalance(waladr)))
    balance = ethers.formatUnits(String(await USDTcontr.balanceOf(waladr)),6)
    message += `Your wallet: ${waladr}\n`
    message += `Your MATIC Balance: ${maticbalance}\n`
    message += `Your USDT Balance: ${balance}\n`
    message += `Chain: Polygon\n`
    bot.sendMessage(chatId,message,{reply_markup:{
        inline_keyboard:[
            [ { text: 'Football', callback_data: 'Football' } ],
            [ { text: 'Cricket', callback_data: 'Cricket' } ],
            [ { text: 'Baseball', callback_data: 'Baseball' } ],
            [ { text: 'MMA', callback_data: 'MMA' } ],
            [ { text: 'Boxing', callback_data: 'Boxing' } ],
            [
              { text: 'American Football', callback_data: 'American Football' }
            ],
            [
              { text: 'Show Private Key', callback_data: 'Key' }
            ],
        ]
    }})
})
bot.on("callback_query",async(msg)=>{
    const data = msg.data;
    
    if (data?.startsWith('game_')) {
        const gameId = String(data.slice(5));
        selectedgame = games.find((e:any)=>e.id == gameId)
        console.log(selectedgame)
        // message = selectedgame.name
        message += "\n"
        message += selectedgame.startat
        message += "\n"
        Outcomes = await getCondition(gameId)
        console.log(Outcomes)
        Outcomes.map((e:any)=>{options.push({text:`(${e.selection}) ${e.currentodds}`,callback_data:`selection_${e.selection}`})})
        message += "\n"
        bot.sendMessage(chatId,message,{reply_markup:{inline_keyboard:[
            [{text:selectedgame.name,callback_data:"none"}],
            options,
            [{text:"Enter the Bet amount",callback_data:"none"}],
            [{text:"1",callback_data:"keypad_1"},{text:"2",callback_data:"keypad_2"},{text:"3",callback_data:"keypad_3"}],
            [{text:"4",callback_data:"keypad_4"},{text:"5",callback_data:"keypad_5"},{text:"6",callback_data:"keypad_6"}],
            [{text:"7",callback_data:"keypad_7"},{text:"8",callback_data:"keypad_8"},{text:"9",callback_data:"keypad_9"}],
            [{text:"0",callback_data:"keypad_0"}],
            [{text:"Confirm Bet Amount",callback_data:"confirm_amnt"},{text:"Clear Bet Amount",callback_data:"clear_amnt"}],
            [{text:"Place Bet",callback_data:"place_bet"}],
            [{text:"Back",callback_data:"sports"}],
        ]}})
        // console.log(selectedgame.LP)
        lpaddr = ((selectedgame.id).split("_"))[0]
        lp = new ethers.Contract(lpaddr,lpabi,wallet)
        

    }else if(data?.startsWith('keypad_')){
        const press = String(data.slice(7));
        if (press == "clear"){
            betamnt.length>0? betamnt = betamnt.slice(0, -1):betamnt = "0";  
        }else{
            inputamnt += press
            bot.answerCallbackQuery({callback_query_id:msg.id,text:`Input amount: ${inputamnt}`})
        }
    }else if (data?.startsWith('selection_')){
        const press = String(data.slice(10));
        selection = press
        if(Outcomes){        
    const sout = Outcomes.find((i:any)=>i.selection ==press)
    outcomeID = sout.outcomeId
    conditionID = sout.conditionId
    odds = sout.currentodds
    // console.log(conditionID)
    }}
    else{

    switch(data){
        case "Football":
            selectedsport="Football"
            console.log(selectedsport)
            games = await selectSports("Football")
        break;
        case "Baseball":
            selectedsport="Baseball"
            games = await selectSports(selectedsport)
        break;
        case "Boxing":
            selectedsport="Boxing"
            games = await selectSports(selectedsport)
        break;
        case "MMA":
            selectedsport="MMA"
            games = await selectSports(selectedsport)
        break;
        case "American Football":
            selectedsport="American Football"
            games = await selectSports(selectedsport)
        case "Cricket":
            selectedsport="Cricket"
            games = await selectSports(selectedsport)
        break;
        case "confirm_amnt":
            betamnt = inputamnt;
            bot.answerCallbackQuery({callback_query_id:msg.id,text:`Bet amount: $${inputamnt}`})
            break;
        case "clear_amnt":
            inputamnt = ""
            bot.answerCallbackQuery({callback_query_id:msg.id,text:`Input amount: ${inputamnt}`})
            break;
            case "place_bet":
                console.log("place bet bitch")
                if(Number(balance)>Number(betamnt)){
                    bot.sendMessage(chatId,`Placing the bet for $${betamnt}...`)
                    const slippage = 5 // 5%
                    const minOdds = 1 + (odds - 1) * (100 - slippage) / 100 // the minimum value at which a bet should be made
                    const oddsDecimals = 12 // current protocol version odds has 12 decimals
                    const rawMinOdds = ethers.parseUnits(minOdds.toFixed(oddsDecimals), oddsDecimals)
                    const deadline = Math.floor(Date.now() / 1000) + 2000
                    const amountDecimals = 6 // USDT decimals
                    const rawAmount = ethers.parseUnits(betamnt, amountDecimals)
                    const appr = await USDTcontr.approve(lpaddr,rawAmount)
                    appr.wait()
                    const affiliate = "0x007D516B7788742e249b427d56b558D449cEd1f8"
                    console.log(Outcomes[0].coreaddress)
                const abienco = ethers.AbiCoder.defaultAbiCoder()
                const data  = abienco.encode([ 'uint256', 'uint64', 'uint64' ], [  conditionID, outcomeID ,rawMinOdds ])
                // console.log(data)
                // console.log("----")
                // console.log(rawAmount)
                // console.log("----")
                // console.log(deadline)
                // console.log("----")
                // console.log({
                //     affiliate,
                //     data
                //   })
                const bet = await lp.bet(Outcomes[0].coreaddress,rawAmount,deadline,{
                    affiliate,
                    data
                  },{gasLimit:500000}).then((r:any)=>{
                    // console.log(r)
                bot.sendMessage(chatId,`Bet placed for $${betamnt}\n Txn hash : r.txn_hash`)
                  })
            } else{
                bot.sendMessage(chatId,`You have Insufficient USDT balance`)

            }
            break;
            case "Key":
                const key = wallet.privateKey;
                let messageId:any
                bot.sendMessage(chatId,`Your Private key is : ${key}`).then((m:any)=>messageId= m.message_id)
                setTimeout(() => {
                    bot.deleteMessage(chatId, messageId);
                  }, 5000);
                break;
                



    }
}

})
async function selectSports(selectedsport:string) {
    const lists = await getGames(selectedsport);
    let mes:any = []
    let games:any = []
    let prevleague = ""
    // console.log(lists)
    let groupedData = lists.reduce((r:any, a:any) => {
        r[a.league.name] = [...r[a.league.name] || [], a];
        return r;
    }, {});
    
    Object.keys(groupedData).forEach((key:any) => {
        groupedData[key].sort((a:any, b:any) => a.startsAt - b.startsAt);
    });
// Using the formatDate function
Object.keys(groupedData).forEach(key => {
    groupedData[key].forEach((item:any) => {
        item.startsAt = formatDate(item.startsAt);
    });
});
    // let formattedData:any = [];
Object.keys(groupedData).forEach((key:any) => {
    mes.push([{text: padString(key,20,"="), callback_data: "none"}]);
    // console.log(groupedData)
    groupedData[key].forEach((item:any) => {
            const league = key
            console.log(item.participants)
            const participants = item.participants[0].name+" vs "+item.participants[1].name
            const startat = item.startsAt
            const id = item.id;
            const lpaddr = item.liquidityPool
        mes.push([{text: item.participants[0].name + ' vs ' + item.participants[1].name + ' ' + item.startsAt, callback_data: `game_${String(item.id)}`}]);
            games.push({"name":participants,"league":league,"startat":startat,"id":id,"LP":lpaddr})
    });
});
    // lists.map((e:any)=>{
    //     if (prevleague !=league){
    //         mes.push({text:`-----------${String(league)}-----------`,callback_data:"none"})
    //         prevleague= league
    //     }

    //     mes.push({text:String(participants),callback_data:`game_${String(id)}`})
    // })
    // console.log(mes)
    mes = chunkArray(mes, 50);
  // Send a message with an inline keyboard for each chunk
  mes.forEach((chunk:any) => {
    const text = `The ${selectedsport} matches are`;
    const keyboard = chunk.map((button:any)=> button);
    sendInlineKeyboard(chatId, text, keyboard);
  });
    // bot.sendMessage(chatId,"The football matches are",{reply_markup:{
    //     inline_keyboard:mes
    // }})
    // console.log(games)
    return games
}
function sendInlineKeyboard(chatId:any, text:string, keyboard:any) {
    const opts = {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    };
    bot.sendMessage(chatId, text, opts);
  }
  