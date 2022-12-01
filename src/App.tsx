import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
const utf8 = require('utf8');

const usersMessage = new Map<string, messageBase[][]>()
const groupMessage = new Map<string, messageBase[][]>()
const strangerMessage = new Map<string, messageBase[][]>()
const userInfo = {
  name: "無法取得"
}
const avatars = [...getRandomAvatarURLArray(), ...getRandomAvatarURLArray(), ...getRandomAvatarURLArray(), ...getRandomAvatarURLArray(), ...getRandomAvatarURLArray(), ...getRandomAvatarURLArray(), ...getRandomAvatarURLArray()]

function App() {
  const [showing, setShowing] = useState("Main")
  return (
    <div className=" w-screen min-h-screen overflow-x-clip">
      <div className='bg-secondary'>
        <div className='container mx-auto'>
          <Navbar />
        </div>
      </div>
      <div className='bg-light/30 container mx-auto'>
        {showing == "Main" && <Main setShowing={setShowing} />}
        {showing == "Loading" && <Loading />}
        {showing == "DataSelection" && <DataSelection />}
      </div>
    </div>
  );
}

const Navbar = () => {
  const [menu, setMenu] = useState(false)
  return (
    <div className='flex flex-row justify-between items-center py-2 px-6'>
      <a href='/' className='flex flex-row items-center'>
        <img src={logo} className="w-8 h-8 brightness-90 mr-4" alt="Instagram 圖標" />
        <span className='font-semibold text-2xl text-light'>Instagram 訊息分析</span>
      </a>
      <div className='flex items-center'>
        <button onClick={(e) => setMenu(!menu)} className='md:hidden w-5 h-5 bg-local bg-contain fill-light' style={{ backgroundImage: "url(/menu.svg)" }}></button>
        <ul className={menu ? `absolute top-20 left-0 w-full flex flex-col bg-light rounded space-y-2 p-4 text-dark font-medium items-center` : `hidden md:flex flex-row space-x-4 text-light font-medium`}>
          <li className='hover:text-greenlight hover:scale-105 transition-all'><a href='#beispiel'>範例</a></li>
          <li className='hover:text-greenlight hover:scale-105 transition-all'><a href='https://github.com/kami-sqmf/insta-message-analyzer'>Code</a></li>
          <li className='hover:text-greenlight hover:scale-105 transition-all'><a href='https://github.com/kami-sqmf/'>Author</a></li>
          <li className='hover:text-greenlight hover:scale-105 transition-all'><a href='/resources.json'>Resources</a></li>
        </ul>
      </div>
    </div>)
}

const Loading = () => (
  <div className='w-full mx-auto p-5 mt-6 flex-col flex items-center justify-center'>
    <p className='text-2xl text-greendark mb-2'>藍色小精靈：這個資料量太恐怖了！</p>
    <img src="/loading.gif" alt="載入中啦！" />
    <p className='text-2xl text-greenlight mt-3 font-bold animate-ping'>正在載入中！</p>
  </div>
)

const Error = ({ error }: { error: string }) => (
  <div className='w-full mx-auto p-5 mt-6 flex-col flex items-center justify-center'>
    <p className='text-2xl text-greendark mb-2'>藍色小精靈：你的資料有鬼啊！</p>
    <img src="/error.gif" alt="載入中啦！" />
    <p className='text-2xl text-greenlight mt-3 font-bold animate-ping'>錯誤：{error}</p>
  </div>
)

const Main = ({ setShowing }: { setShowing: Dispatch<SetStateAction<string>> }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const fileReader = async (e: Event & { target: HTMLInputElement }) => {
    setShowing("Loading")
    if (e.target.files && e.target.files.length) {
      const query = Object.values(e.target.files).filter((e) => /^message_\d*\.json$/.test(e.name))
      for (const profile of query) {
        const data: jsonStuff = await readFileAsync(profile) as any
        const title = utf8.decode(data.title)
        const userMessage = usersMessage.get(title)
        if (data.thread_type == "Regular") usersMessage.set(title, userMessage ? [...userMessage, data.messages as any] : [data.messages]);
        else if (data.thread_type == "RegularGroup") groupMessage.set(title, groupMessage.get(title) ? [...groupMessage.get(title)!, data.messages as any] : [data.messages]);
        else strangerMessage.set(title, groupMessage.get(title) ? [...groupMessage.get(title)!, data.messages as any] : [data.messages]);
        if (data.thread_type == "Regular" && userInfo.name == "無法取得") userInfo.name = utf8.decode(data.participants[1].name);
      }
      setShowing("DataSelection")
    }
  }
  return (
    <div className='w-full h-64 px-8 py-8 flex flex-col justify-around'>
      <div>
        <span className='mr-2'>1. 先登入至 Instagram 帳號 (已登入可跳過)</span>
        <span className='text-primary font-bold hover:text-secondary'><a href='https://www.instagram.com/' target="_blank" rel="noopener noreferrer">https://www.instagram.com/</a></span>
      </div>
      <div>
        <span className='mr-2'>2. 請先下載 JSON 備份資料檔</span>
        <span className='text-primary font-bold hover:text-secondary'><a href='https://www.instagram.com/download/request/' target="_blank" rel="noopener noreferrer">https://www.instagram.com/download/request/</a></span>
      </div>
      <p>3. 然後解壓縮下載的檔案</p>
      <div className='px-4 py-3 bg-light text-primary font-black hover:scale-105 transition-all w-max cursor-pointer rounded hover:text-secondary' onClick={() => fileInput.current?.click()}>4. 按此選擇以解壓縮的資料夾</div>
      <input hidden directory="" webkitdirectory="" multiple type="file" id="filepicker" name="fileList" ref={fileInput} onChange={(e: any) => fileReader(e)} />
      <p className='text-gray-400 text-xs'>* 本操作不會上傳任何資料，只在本地執行。詳情請看原始碼。</p>
    </div>
  )
}

const DataSelection = () => {
  const [analysis, setAnalysis] = useState(null as any)
  const [error, setError] = useState("")
  const renderAnalysis = (messageArrays: messageBase[][], userName: string, avatars: string) => {
    try {
      const analyzed = {
        target: userName,
        avatars: avatars,
        message: {
          length: 0,
          totalWords: 0,
          avgWords: 0,
          sentLength: 0,
          recievedLength: 0,
          sentTotalWords: 0,
          recievedTotalWords: 0,
          sentAvgWords: 0,
          recievedAvgWords: 0,
        },
        call: {
          length: 0,
          totalSeconds: 0,
          avgSeconds: 0,
        },
        startDay: 0,
        endDay: 0,
        totalDay: 0,
        reactions: {
          sent: [""],
          recevied: [""]
        }
      }
      setError("")
      const messages: { type: "Message" | "Media" | "Call" | "Other"; content: string | null; timestamp: number; callDuration: number | null; recevied: Boolean; sentReactions: string | null; recievedReactions: string | null; }[] = new Array();
      for (const messageArray of messageArrays) {
        for (const message of messageArray) {
          let type: "Message" | "Media" | "Call" | "Other" = "Other";
          let sentReactions: string | null = null;
          let recievedReactions: string | null = null;
          if (message.bumped_message_metadata.bumped_message) type = "Message";
          else if (message.photos || message.videos || message.audio_files || message.share) type = "Media";
          else if (message.call_duration) type = "Call"
          if (message.reactions) {
            for (const reaction of message.reactions) {
              if (utf8.decode(reaction.actor) == userInfo.name) sentReactions = reaction.reaction
              else recievedReactions = reaction.reaction
            }
          }
          messages.push({
            type: type,
            content: message.content ? utf8.decode(message.content) : null,
            timestamp: message.timestamp_ms,
            callDuration: type.startsWith("Call") ? message.call_duration! : null,
            recevied: utf8.decode(message.sender_name) == userInfo.name ? false : true,
            sentReactions: sentReactions,
            recievedReactions: recievedReactions
          })
        }
      }
      for (const message of messages) {
        if (message.type == "Other") continue;
        else if (message.type == "Message" || message.type == "Media") {
          analyzed.message.length++;
          analyzed.startDay = analyzed.startDay == 0 || analyzed.startDay > message.timestamp ? message.timestamp : analyzed.startDay;
          analyzed.endDay = analyzed.endDay < message.timestamp ? message.timestamp : analyzed.endDay;
          if (message.content) {
            analyzed.message.totalWords += message.content.length;
          }
          if (message.recevied) {
            analyzed.message.recievedLength++;
            message.content ? analyzed.message.recievedTotalWords += message.content.length : analyzed.message.sentTotalWords += 0;
          } else {
            analyzed.message.sentLength++;
            message.content ? analyzed.message.sentTotalWords += message.content.length : analyzed.message.sentTotalWords += 0;
          }
        } else if (message.callDuration) {
          analyzed.call.length++;
          analyzed.call.totalSeconds += message.callDuration / 1000;
        }
      }
      analyzed.reactions.recevied = (Object.fromEntries(
        Object.entries(messages.reduce(function (prev: any, cur) {
          if (cur.recievedReactions) prev[cur.recievedReactions] = (prev[cur.recievedReactions] || 0) + 1;
          return prev;
        }, {})).sort(([, a], [, b]) => b as any - (a as any))) as any
      );
      analyzed.reactions.sent = (Object.fromEntries(
        Object.entries(messages.reduce(function (prev: any, cur) {
          if (cur.sentReactions) prev[cur.sentReactions] = (prev[cur.sentReactions] || 0) + 1;
          return prev;
        }, {})).sort(([, a], [, b]) => b as any - (a as any))) as any
      );
      analyzed.message.avgWords = analyzed.message.totalWords / analyzed.message.length;
      analyzed.call.avgSeconds = analyzed.call.totalSeconds / analyzed.call.length;
      analyzed.message.recievedAvgWords = analyzed.message.recievedTotalWords / analyzed.message.recievedLength;
      analyzed.message.sentAvgWords = analyzed.message.sentTotalWords / analyzed.message.sentLength;
      analyzed.totalDay = (analyzed.endDay - analyzed.startDay) / 1000 / 60 / 60 / 24;
      setAnalysis(analyzed);
    } catch (e) {
      setError(e as any)
    }
  }
  return (
    <div className='grid grid-cols-3 mt-6 rounded border border-secondary/60'>
      <div className='col-span-1 border-r-2 border-greendark overflow-y-scroll overflow-x-clip max-h-screen'>
        <div className='flex flex-col items-center justify-center relative'>
          <p className='py-3 px-4 w-full text-center border-b-2 text-primary font-bold sticky'>{userInfo.name}</p>
          {Array.from(usersMessage.keys()).sort((a, b) => usersMessage.get(b)![usersMessage.get(b)!.length - 1][0].timestamp_ms - usersMessage.get(a)![usersMessage.get(a)!.length - 1][0].timestamp_ms).map((username, key) => {
            const data = usersMessage.get(username);
            const avatar = avatars[key];
            return (
              <div className='md:px-3 lg:px-6 py-4 flex flex-row w-full space-x-2 cursor-pointer hover:bg-gray-200' onClick={(e) => renderAnalysis(data!, username, avatar)} key={key}>
                <img className='h-12 w-12 rounded-full' src={avatar} alt="隨機大頭貼" />
                <div className='flex flex-col justify-start items-start w-full'>
                  <span className='text-primary font-bold'>{username}</span>
                  <div className='w-full grid grid-cols-3'>
                    <span className='text-secondary truncate col-span-2'>{getRecentMessage(data![data!.length - 1][0])}</span>
                    <span className='col-span-1 text-secondary/70'>{new Date(data![data!.length - 1][0].timestamp_ms).toLocaleDateString("zh-TW")}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className='col-span-2'>
        {error && <Error error={error} />}
        {analysis && <div className='flex-col px-8 py-3 space-y-4'>
          <div className='w-full text-center border-b-2 text-primary font-medium sticky flex flex-row items-center pb-2'>
            <img alt='Random' src={analysis.avatars} className="w-6 h-6 rounded-full"></img>
            <span className='font-bold text-primary text-lg ml-3'>{analysis.target}</span>
          </div>
          <div className='border-2 border-secondary bg-gradient-to-r from-light/50 via-light to-light/70 rounded-md p-2 flex flex-row space-x-8 w-max'>
            <div className='flex flex-col'>
              <p className='font-bold text-primary'>訊息數</p>
              <span className='font-black text-xl text-primary/60'>{analysis.message.length}</span>
            </div>
            <div className='flex flex-col'>
              <p className='font-bold text-primary'>聊天天數</p>
              <span className='font-black text-xl text-primary/60'>{analysis.totalDay < 0 ? "少於一天" : Math.round(analysis.totalDay)}</span>
            </div>
            <div className='flex flex-col'>
              <p className='font-bold text-primary'>通話數</p>
              <span className='font-black text-xl text-primary/60'>{analysis.call.length}</span>
            </div>
            <div className='flex flex-col'>
              <p className='font-bold text-primary'>通話時長</p>
              <span className='font-black text-xl text-primary/60'>{timeFormatter(analysis.call.totalSeconds)}</span>
            </div>
          </div>
          <div className='border-2 border-secondary bg-gradient-to-r from-light/90 via-light/50 to-light/70 rounded-md p-2 flex flex-row space-x-8 w-max'>
            <div className='flex flex-col'>
              <p className='font-bold text-primary'>您傳送訊息數</p>
              <span className='font-black text-xl text-primary/60'>{analysis.message.sentLength}</span>
            </div>
            <div className='flex flex-col'>
              <p className='font-bold text-primary'>您傳送總字數</p>
              <span className='font-black text-xl text-primary/60'>{analysis.message.sentTotalWords}</span>
            </div>
            <div className='flex flex-col'>
              <p className='font-bold text-primary'>您傳送平均字數</p>
              <span className='font-black text-xl text-primary/60'>{analysis.message.sentAvgWords.toFixed(2)}</span>
            </div>
          </div>
          <div className='border-2 border-secondary bg-gradient-to-r from-light/70 via-light/50 to-light/90 rounded-md p-2 flex flex-row space-x-8 w-max'>
            <div className='flex flex-col'>
              <p className='font-bold text-primary'>{analysis.target} 傳送的訊息數</p>
              <span className='font-black text-xl text-primary/60'>{analysis.message.recievedLength}</span>
            </div>
            <div className='flex flex-col'>
              <p className='font-bold text-primary'>{analysis.target} 傳送的總字數</p>
              <span className='font-black text-xl text-primary/60'>{analysis.message.recievedTotalWords}</span>
            </div>
            <div className='flex flex-col'>
              <p className='font-bold text-primary'>{analysis.target} 傳送的平均字數</p>
              <span className='font-black text-xl text-primary/60'>{analysis.message.recievedAvgWords.toFixed(2)}</span>
            </div>
          </div>
          <div className='border-2 border-secondary bg-gradient-to-r from-light/70 via-light/50 to-light/90 rounded-md p-2 flex flex-row space-x-8 w-max items-center'>
            <p className='font-bold text-primary'>你最常按的5個表符</p>
            {Object.keys(analysis.reactions.sent).slice(0, 5).map((reaction, key) => (
              <div key={key}>
                <p className='text-lg'>{utf8.decode(reaction)}</p>
                <p className='font-black text-xl text-primary/60'>{analysis.reactions.sent[reaction]} 次</p>
              </div>
            ))}
            {Object.keys(analysis.reactions.sent).length == 0 && <p className='font-black text-xl text-primary/60'>沒有按過啊！！</p>}
          </div>
          <div className='border-2 border-secondary bg-gradient-to-r from-light/70 via-light/50 to-light/90 rounded-md p-2 flex flex-row space-x-8 w-max items-center'>
            <p className='font-bold text-primary'>{analysis.target} 最常按的5個表符</p>
            {Object.keys(analysis.reactions.recevied).slice(0, 5).map((reaction, key) => (
              <div key={key}>
                <p className='text-lg'>{utf8.decode(reaction)}</p>
                <p className='font-black text-xl text-primary/60'>{analysis.reactions.recevied[reaction]} 次</p>
              </div>
            ))}
            {Object.keys(analysis.reactions.recevied).length == 0 && <p className='font-black text-xl text-primary/60'>沒有按過啊！！</p>}
          </div>
        </div>}
      </div>
    </div>
  )
}

export default App;

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // extends React's HTMLAttributes
    directory?: string;
    webkitdirectory?: string;
  }
}

function readFileAsync(file: File) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result == "string") resolve(JSON.parse(reader.result));
      resolve({})
    };

    reader.onerror = reject;

    reader.readAsText(file);
  })
}

function getRandomAvatarURLArray() {
  const arr = []
  for (let i = 0; i < 65; i++) {
    arr.push(`/avatar/${i}.png`)
  }
  return (shuffle(arr))
}

function shuffle(a: Array<string>) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

function getRecentMessage(message: messageBase) {
  if (message.content) return utf8.decode(message.content);
  else if (message.photos) return "傳送了一張照片";
  else if (message.audio_files) return "傳送了一條語音";
  else if (message.call_duration) return "跟你來個通話";
  else if (message.share) return "跟你分享了一些好康的";
  else if (message.videos) return "傳送了一個影片";
}

function timeFormatter(seconds: number) {
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor(seconds % (3600 * 24) / 3600);
  var m = Math.floor(seconds % 3600 / 60);
  var s = Math.floor(seconds % 60);

  var dDisplay = d > 0 ? d + "天 " : "";
  var hDisplay = h > 0 ? h + "時 " : "";
  var mDisplay = m > 0 ? m + "分 " : "";
  var sDisplay = s + "秒 ";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}