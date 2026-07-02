import { useState, useRef, useEffect, useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

/* ─── STYLES ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Syne:wght@800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#07060d;font-family:'Inter',sans-serif;color:#fff;overflow-x:hidden}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{transform:translateY(110%)}to{transform:translateY(0)}}
@keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
@keyframes fillBar{from{width:0%}to{width:100%}}
@keyframes splashIn{0%{opacity:0;letter-spacing:14px}100%{opacity:1;letter-spacing:4px}}
.au{animation:fadeUp .3s ease forwards}
.as{animation:slideUp .28s cubic-bezier(.16,1,.3,1) forwards}
.si{animation:splashIn 1.4s cubic-bezier(.16,1,.3,1) forwards}
.st{background:linear-gradient(90deg,#fff,#9d6fff,#ff6b9d,#fff);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 4s linear infinite}
.gt{background:linear-gradient(90deg,#ffd700,#fffaaa,#ffd700);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite}
.wb{animation:fillBar 2s linear forwards}
button{cursor:pointer;-webkit-tap-highlight-color:transparent}
input[type=range]{accent-color:#9d6fff;width:100%}
::-webkit-scrollbar{width:2px}
::-webkit-scrollbar-thumb{background:#2a2040;border-radius:2px}
`;

/* ─── DATA ─── */
const STUDIOS=[
  {id:"marvel",name:"Marvel Studios",icon:"⚡",budget:250,minRep:80,bonus:"Franchise ×2.5",color:"#e8b84b"},
  {id:"disney",name:"Walt Disney",icon:"✦",budget:200,minRep:75,bonus:"Distribution +40%",color:"#4b9de8"},
  {id:"wb",name:"Warner Bros.",icon:"◈",budget:180,minRep:65,bonus:"IP library access",color:"#4be8b8"},
  {id:"a24",name:"A24",icon:"▲",budget:40,minRep:55,bonus:"Award season push",color:"#b84be8"},
  {id:"uni",name:"Universal",icon:"◉",budget:160,minRep:60,bonus:"Theme park royalties",color:"#e84b4b"},
  {id:"indie",name:"Independent",icon:"◇",budget:5,minRep:0,bonus:"Full creative control",color:"#888"},
];
const ACTORS=[
  {id:1,name:"Ryan Blackwell",skill:92,fame:88,salary:15,genres:["Action","Thriller"],emoji:"🎭"},
  {id:2,name:"Sophia Vance",skill:96,fame:95,salary:25,genres:["Drama","Romance"],emoji:"👑"},
  {id:3,name:"Marcus Cole",skill:78,fame:70,salary:8,genres:["Comedy","Action"],emoji:"😄"},
  {id:4,name:"Elena Reyes",skill:89,fame:82,salary:12,genres:["Horror","Thriller"],emoji:"🌙"},
  {id:5,name:"Damon Holt",skill:85,fame:91,salary:20,genres:["Sci-Fi","Action"],emoji:"🚀"},
  {id:6,name:"Nia Sato",skill:91,fame:76,salary:10,genres:["Drama","Indie"],emoji:"🌸"},
  {id:7,name:"Carlos Meza",skill:72,fame:60,salary:5,genres:["Comedy","Family"],emoji:"🎪"},
  {id:8,name:"Iris Lund",skill:88,fame:84,salary:14,genres:["Fantasy","Drama"],emoji:"✨"},
  {id:9,name:"Theo Park",skill:80,fame:68,salary:7,genres:["Thriller","Horror"],emoji:"🔪"},
  {id:10,name:"Valentina Cruz",skill:94,fame:97,salary:30,genres:["Action","Fantasy"],emoji:"⚡"},
];
const SCRIPTS=[
  {title:"Neon Crusade",genre:"Action",quality:88,cost:2,emoji:"💥"},
  {title:"Whisper of the Deep",genre:"Thriller",quality:82,cost:1.5,emoji:"🌊"},
  {title:"Last Laughs",genre:"Comedy",quality:75,cost:1,emoji:"😂"},
  {title:"Remnants",genre:"Sci-Fi",quality:91,cost:3,emoji:"🚀"},
  {title:"The Hollow Crown",genre:"Drama",quality:93,cost:2.5,emoji:"👑"},
  {title:"Blood Moon Rising",genre:"Horror",quality:79,cost:1.5,emoji:"🩸"},
  {title:"Ever After Protocol",genre:"Fantasy",quality:86,cost:2,emoji:"✨"},
  {title:"Quiet Fire",genre:"Indie",quality:90,cost:0.5,emoji:"🔥"},
  {title:"Family Frequency",genre:"Family",quality:72,cost:1,emoji:"🏡"},
  {title:"Stardust Covenant",genre:"Romance",quality:84,cost:1.5,emoji:"💫"},
];
const CEREMONIES=[
  {id:"sundance",name:"Sundance",icon:"🎿",week:3,minRep:10,repGain:6,moneyGain:1},
  {id:"bafta",name:"BAFTA",icon:"🎭",week:7,minRep:40,repGain:7,moneyGain:0},
  {id:"globes",name:"Golden Globes",icon:"🌐",week:8,minRep:45,repGain:8,moneyGain:0},
  {id:"oscars",name:"The Oscars",icon:"🏆",week:10,minRep:60,repGain:14,moneyGain:0},
  {id:"cannes",name:"Cannes",icon:"🌴",week:20,minRep:35,repGain:10,moneyGain:2},
  {id:"venice",name:"Venice",icon:"🚤",week:36,minRep:40,repGain:9,moneyGain:1},
];
const MEETINGS=[
  {id:"m1",icon:"☕",title:"Coffee with a Producer",desc:"A producer wants your next idea.",minRep:0,cost:0,repGain:2,moneyGain:0,opts:["Take it","Pass"],res:["Great chemistry. +2 rep.","You pass."]},
  {id:"m2",icon:"🍽",title:"Power Lunch at Nobu",desc:"A distributor wants a first-look deal.",minRep:30,cost:0.5,repGain:5,moneyGain:3,opts:["Attend ($0.5M)","Skip"],res:["Deal sealed. +5 rep +$3M.","Opportunity lost."]},
  {id:"m3",icon:"🎤",title:"Late Night Talk Show",desc:"8 million viewers waiting.",minRep:20,cost:0,repGain:4,moneyGain:0,opts:["Go on air","Cancel"],res:["Goes viral. +4 rep.","PR team furious."]},
  {id:"m4",icon:"🏨",title:"Studio Pitch Meeting",desc:"Top studio boardroom. High stakes.",minRep:40,cost:0,repGain:6,moneyGain:5,opts:["Pitch boldly","Play safe"],res:["Greenlit! +6 rep +$5M.","No deal yet."]},
  {id:"m5",icon:"🎓",title:"Film School Masterclass",desc:"USC invites you to lecture.",minRep:25,cost:0,repGain:3,moneyGain:0.5,opts:["Accept","Decline"],res:["Standing ovation. +3 rep.","They found someone else."]},
  {id:"m6",icon:"📡",title:"Streamflix Series Deal",desc:"Streamflix wants an exclusive deal.",minRep:50,cost:0,repGain:4,moneyGain:8,opts:["Explore it","Stay films"],res:["Signed! +4 rep +$8M.","You hold firm."]},
];
const PREMIERES=[
  {id:"world",name:"World Premiere",icon:"🌟",venue:"Grauman's Chinese Theatre",cost:2,repGain:8,moneyGain:3},
  {id:"festival",name:"Festival Premiere",icon:"🎪",venue:"Cannes Palais",cost:1,repGain:6,moneyGain:1},
  {id:"charity",name:"Charity Premiere",icon:"💛",venue:"Lincoln Center",cost:1.5,repGain:7,moneyGain:0},
  {id:"stream",name:"Streaming Launch",icon:"📺",venue:"Streamflix HQ",cost:0.5,repGain:3,moneyGain:5},
];
const LOANS=[
  {id:"l1",name:"First National Bank",amount:20,interest:.12,term:52,minRep:0,color:"#4caf8a"},
  {id:"l2",name:"Studio Advance",amount:40,interest:.15,term:52,minRep:30,color:"#4b9de8"},
  {id:"l3",name:"Hedge Fund",amount:80,interest:.20,term:52,minRep:50,color:"#e8b84b"},
  {id:"l4",name:"Venture Capital",amount:150,interest:.25,term:52,minRep:65,color:"#b84be8"},
  {id:"l5",name:"Sovereign Fund",amount:300,interest:.30,term:52,minRep:80,color:"#e84b4b"},
];
const WEEK_EVENTS=[
  {msg:"Trade paper calls you a director to watch",rep:3,money:0,icon:"📰"},
  {msg:"Your last film scored a streaming deal",rep:0,money:2,icon:"📺"},
  {msg:"Buzz building around your next project",rep:4,money:0,icon:"🔥"},
  {msg:"Studio investors nervous after market dip",rep:0,money:-1,icon:"📉"},
  {msg:"Anonymous investor sends a check",rep:0,money:3,icon:"💰"},
  {msg:"Industry guild sends honorary membership",rep:5,money:0,icon:"🏅"},
  {msg:"A key crew member quit mid-prep",rep:-2,money:0,icon:"😤"},
  {msg:"An old film went viral online",rep:3,money:1,icon:"🌐"},
  {msg:"A celebrity shared your work publicly",rep:2,money:0,icon:"⭐"},
  {msg:"You gave a compelling industry interview",rep:2,money:0,icon:"🎤"},
  {msg:"Your agent negotiated a surprise bonus",rep:0,money:4,icon:"💼"},
];
const DAILY_EVENTS=[
  {icon:"🏋",text:"Hit the gym at 5am. You feel unstoppable.",rep:1,money:0},
  {icon:"🍜",text:"Lunch at Nobu. Spotted by Page Six.",rep:1,money:-.05},
  {icon:"📱",text:"Your GrammGramm post broke 1M likes.",rep:3,money:0},
  {icon:"🏌",text:"Golf round with a studio exec. Shot a birdie.",rep:2,money:0},
  {icon:"📰",text:"Woke up to a glowing profile in Variety.",rep:3,money:0},
  {icon:"🤧",text:"Caught a cold. Missed two meetings.",rep:-1,money:0},
  {icon:"🎂",text:"Surprise birthday party from your cast.",rep:2,money:0},
  {icon:"🧘",text:"Meditation cleared your creative block.",rep:1,money:0},
  {icon:"🎸",text:"Impromptu jam with a rock legend.",rep:2,money:0},
  {icon:"✈",text:"Flew to NYC first class for a 2-hour meeting.",rep:0,money:-.1},
];
const CONTRACTS=[
  {id:"marvel_c",studio:"Marvel Cinematic",icon:"⚡",color:"#e8b84b",category:"Blockbuster",minRep:80,minFilms:5,budget:250,repGain:15,moneyGain:50,perks:["Franchise guaranteed","Global distribution","Merchandise royalties"]},
  {id:"dc_c",studio:"DC Studios",icon:"🦇",color:"#4b9de8",category:"Blockbuster",minRep:75,minFilms:4,budget:220,repGain:13,moneyGain:45,perks:["Iconic IP access","Global release","Sequel options"]},
  {id:"disney_c",studio:"Walt Disney Pictures",icon:"✦",color:"#ff6b9d",category:"Blockbuster",minRep:75,minFilms:4,budget:200,repGain:12,moneyGain:40,perks:["Family global reach","Streaming premiere"]},
  {id:"wb_c",studio:"Warner Bros.",icon:"◈",color:"#4be8b8",category:"Blockbuster",minRep:65,minFilms:3,budget:180,repGain:10,moneyGain:35,perks:["IP library access","MAX streaming deal"]},
  {id:"a24_c",studio:"A24 Films",icon:"▲",color:"#b84be8",category:"Prestige",minRep:55,minFilms:2,budget:40,repGain:14,moneyGain:10,perks:["Full creative control","Awards campaign"]},
  {id:"streamflix_c",studio:"Streamflix Originals",icon:"▶",color:"#e84b4b",category:"Streaming",minRep:50,minFilms:2,budget:150,repGain:8,moneyGain:30,perks:["200M+ subscribers","Day-1 global release"]},
  {id:"apple_c",studio:"Apple Original Films",icon:"🍎",color:"#aaa",category:"Streaming",minRep:60,minFilms:3,budget:100,repGain:9,moneyGain:20,perks:["Theatrical Oscar push","Apple TV+ global"]},
  {id:"bollywood_c",studio:"Yash Raj Films",icon:"🎭",color:"#ff6b9d",category:"International",minRep:40,minFilms:1,budget:30,repGain:8,moneyGain:15,perks:["Bollywood audience","India global reach"]},
];
const CHAR_SKILLS=[
  {id:"visionary",name:"Visionary Director",icon:"🎨",color:"#9d6fff",desc:"Your films carry an unmistakable aesthetic.",bonuses:["Script quality +10%","+5 rep on every film"],statBonus:{rep:8,money:0}},
  {id:"hustler",name:"Industry Hustler",icon:"💼",color:"#e8b84b",desc:"You know everyone, owe no one, never miss a deal.",bonuses:["Start with +$10M","Studio deals easier"],statBonus:{rep:0,money:10}},
  {id:"method",name:"Method Artist",icon:"🎭",color:"#ff6b9d",desc:"Your process is legendary. Awards committees adore you.",bonuses:["Award chances doubled","Cast chemistry high"],statBonus:{rep:5,money:0}},
  {id:"technician",name:"Technical Genius",icon:"⚙",color:"#40b0e0",desc:"You understand every camera and lighting rig.",bonuses:["Production costs -15%","VFX stretches further"],statBonus:{rep:3,money:5}},
];
const PROTEGES=[
  {id:"maya",name:"Maya Chen",emoji:"🌸",role:"Assistant Director",color:"#ff6b9d",desc:"Film school grad who won a student Oscar. Unlocks faster script development.",statBonus:{rep:2,money:0}},
  {id:"james",name:"James Okafor",emoji:"🚀",role:"Cinematographer",color:"#40b0e0",desc:"Grew up in Lagos shooting on a phone. Films get +5% box office.",statBonus:{rep:1,money:2}},
  {id:"elena",name:"Elena Vasquez",emoji:"⚡",role:"Producer",color:"#e8b84b",desc:"Former Wall Street analyst. Studio deals give +$5M extra.",statBonus:{rep:0,money:5}},
  {id:"alex",name:"Alex Rivera",emoji:"🎬",role:"Writer-Director",color:"#4caf8a",desc:"Went viral at 19. Script quality always +8. Indie films get award boost.",statBonus:{rep:3,money:0}},
];
const NATS=[
  {id:"us",flag:"🇺🇸",label:"American",city:"Los Angeles",mB:0,rB:0},
  {id:"uk",flag:"🇬🇧",label:"British",city:"London",mB:2,rB:2},
  {id:"fr",flag:"🇫🇷",label:"French",city:"Paris",mB:0,rB:5},
  {id:"jp",flag:"🇯🇵",label:"Japanese",city:"Tokyo",mB:3,rB:0},
  {id:"kr",flag:"🇰🇷",label:"Korean",city:"Seoul",mB:2,rB:3},
  {id:"in",flag:"🇮🇳",label:"Indian",city:"Mumbai",mB:4,rB:0},
  {id:"ng",flag:"🇳🇬",label:"Nigerian",city:"Lagos",mB:5,rB:0},
  {id:"br",flag:"🇧🇷",label:"Brazilian",city:"São Paulo",mB:2,rB:2},
  {id:"it",flag:"🇮🇹",label:"Italian",city:"Rome",mB:0,rB:4},
  {id:"au",flag:"🇦🇺",label:"Australian",city:"Sydney",mB:2,rB:1},
  {id:"mx",flag:"🇲🇽",label:"Mexican",city:"Mexico City",mB:3,rB:1},
  {id:"cn",flag:"🇨🇳",label:"Chinese",city:"Beijing",mB:6,rB:0},
];
const INDS=[
  {id:"hollywood",icon:"🎬",label:"Hollywood Blockbusters",mB:0,rB:0},
  {id:"arthouse",icon:"🎨",label:"Arthouse & Festival",mB:-2,rB:8},
  {id:"horror",icon:"👻",label:"Horror & Genre",mB:3,rB:-2},
  {id:"animation",icon:"✨",label:"Animation Studio",mB:2,rB:2},
  {id:"streaming",icon:"📺",label:"Streaming First",mB:5,rB:-1},
  {id:"documentary",icon:"🎙",label:"Documentary",mB:-1,rB:6},
];
const START_YEARS=[1980,1990,2000,2005,2010,2015,2020,2025];
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const GENRE_COLORS={Action:"#e05555",Drama:"#5577e0",Comedy:"#d4b840",Horror:"#9040c0","Sci-Fi":"#40b0e0",Fantasy:"#40c090",Thriller:"#e08030",Indie:"#909090",Family:"#e06090",Romance:"#e04080"};
const MILESTONES={35:"On the Radar 👁",55:"Rising Star 🌟",75:"A-List ✦",90:"Hollywood Legend 🏆"};
const NAV_ITEMS=[{id:"home",label:"Home",icon:"🏠"},{id:"films",label:"Films",icon:"🎬"},{id:"studio",label:"Studio",icon:"🎥"},{id:"social",label:"Social",icon:"📱"},{id:"shop",label:"Shop",icon:"🛍"},{id:"contracts",label:"Deals",icon:"📋"},{id:"world",label:"World",icon:"🌍"}];
const SHOP_ITEMS=[
  {id:"h1",cat:"Houses",name:"Hollywood Hills Villa",emoji:"🏡",price:2.5,label:"$2.5M",rep:3,img:"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=70"},
  {id:"h2",cat:"Houses",name:"Malibu Beach House",emoji:"🏖",price:5,label:"$5M",rep:4,img:"https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&q=70"},
  {id:"h3",cat:"Houses",name:"Beverly Hills Mansion",emoji:"🏰",price:15,label:"$15M",rep:6,img:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=70"},
  {id:"h4",cat:"Houses",name:"NYC Penthouse",emoji:"🌆",price:25,label:"$25M",rep:7,img:"https://images.unsplash.com/photo-1600607687939-ce8a6d69d58e?w=400&q=70"},
  {id:"h5",cat:"Houses",name:"Monaco Palace",emoji:"🏯",price:80,label:"$80M",rep:10,img:"https://images.unsplash.com/photo-1596436889106-be35e843f974?w=400&q=70"},
  {id:"h6",cat:"Houses",name:"Dubai Sky Penthouse",emoji:"🌃",price:150,label:"$150M",rep:12,img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=70"},
  {id:"c1",cat:"Cars",name:"Porsche 911 Turbo S",emoji:"🏎",price:0.25,label:"$250K",rep:2,img:"https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=400&q=70"},
  {id:"c2",cat:"Cars",name:"Ferrari SF90",emoji:"🏎",price:0.6,label:"$600K",rep:3,img:"https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=400&q=70"},
  {id:"c3",cat:"Cars",name:"Lamborghini Urus",emoji:"🚙",price:0.35,label:"$350K",rep:2,img:"https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?w=400&q=70"},
  {id:"c4",cat:"Cars",name:"Rolls-Royce Phantom",emoji:"🚘",price:0.5,label:"$500K",rep:3,img:"https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=400&q=70"},
  {id:"c5",cat:"Cars",name:"Bugatti Chiron",emoji:"🏎",price:3.9,label:"$3.9M",rep:6,img:"https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400&q=70"},
  {id:"c6",cat:"Cars",name:"Bugatti La Voiture Noire",emoji:"🖤",price:18.7,label:"$18.7M",rep:8,img:"https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=400&q=70"},
  {id:"y1",cat:"Yachts",name:"Motor Yacht 60ft",emoji:"🛥",price:1.2,label:"$1.2M",rep:3,img:"https://images.unsplash.com/photo-1567126207773-f0764c506de3?w=400&q=70"},
  {id:"y2",cat:"Yachts",name:"Superyacht 150ft",emoji:"🛥",price:22,label:"$22M",rep:7,img:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=70"},
  {id:"y3",cat:"Yachts",name:"Mega Yacht 200ft",emoji:"🚢",price:65,label:"$65M",rep:9,img:"https://images.unsplash.com/photo-1565043666747-69f6646db940?w=400&q=70"},
  {id:"y4",cat:"Yachts",name:"Azzam-Class 590ft",emoji:"🛳",price:400,label:"$400M",rep:12,img:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=70"},
  {id:"j1",cat:"Jets",name:"Gulfstream G550",emoji:"✈",price:22,label:"$22M",rep:6,img:"https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=70"},
  {id:"j2",cat:"Jets",name:"Bombardier Global 7500",emoji:"✈",price:55,label:"$55M",rep:8,img:"https://images.unsplash.com/photo-1542296332-2e4473faf563?w=400&q=70"},
  {id:"j3",cat:"Jets",name:"Boeing 747 VIP",emoji:"🛫",price:130,label:"$130M",rep:11,img:"https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&q=70"},
  {id:"cl1",cat:"Clothes",name:"Designer Wardrobe",emoji:"👔",price:0.05,label:"$50K",rep:1,img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70"},
  {id:"cl2",cat:"Clothes",name:"Luxury Watch Collection",emoji:"⌚",price:1,label:"$1M",rep:2,img:"https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400&q=70"},
];
const BIZ_ITEMS=[
  {id:"bz1",name:"Coffee Shop Chain",emoji:"☕",price:0.5,weeklyIncome:0.08,label:"$500K"},
  {id:"bz2",name:"Boutique Hotel",emoji:"🏨",price:3,weeklyIncome:0.3,label:"$3M"},
  {id:"bz3",name:"Fine Dining",emoji:"🍽",price:5,weeklyIncome:0.5,label:"$5M"},
  {id:"bz4",name:"Record Label",emoji:"🎵",price:20,weeklyIncome:1.5,label:"$20M"},
  {id:"bz5",name:"Production Company",emoji:"🎬",price:15,weeklyIncome:1.2,label:"$15M"},
  {id:"bz6",name:"Streaming Platform",emoji:"📺",price:200,weeklyIncome:15,label:"$200M"},
];
const SOCIAL_PLATFORMS=[
  {id:"gg",name:"GrammGramm",icon:"📸",color:"#e1306c",followers:0,baseGain:8000},
  {id:"tx",name:"Twixxter",icon:"🐦",color:"#1da1f2",followers:0,baseGain:5000},
  {id:"fb",name:"Fykebok",icon:"👤",color:"#1877f2",followers:0,baseGain:4000},
  {id:"tt",name:"TikkiTok",icon:"🎵",color:"#69c9d0",followers:0,baseGain:15000},
  {id:"yt",name:"YooToob",icon:"▶",color:"#ff0000",followers:0,baseGain:6000},
  {id:"sc",name:"SnappyChat",icon:"👻",color:"#fffc00",followers:0,baseGain:3000},
  {id:"li",name:"LinkTdin",icon:"💼",color:"#0a66c2",followers:0,baseGain:2000},
  {id:"rd",name:"Reddiit",icon:"🤖",color:"#ff4500",followers:0,baseGain:4000},
  {id:"pt",name:"Pinttrst",icon:"📌",color:"#e60023",followers:0,baseGain:2500},
  {id:"th",name:"Threedz",icon:"🧵",color:"#888",followers:0,baseGain:7000},
];
const COMMUNITY_POSTS=[
  {user:"Steven Playfair",avatar:"🎬",text:"The secret to storytelling? Never explain what you can show.",likes:4820,time:"2h"},
  {user:"Sofia Vellano",avatar:"🌹",text:"Just wrapped 94 days of principal photography. Would do it again.",likes:3210,time:"5h"},
  {user:"Park Jun-ho",avatar:"🎭",text:"Korean cinema isn't a genre. It's a philosophy.",likes:6710,time:"1d"},
  {user:"Meryl Stripes",avatar:"👑",text:"A character is a collection of contradictions. Perfect = not human.",likes:11200,time:"3h"},
  {user:"Denzel Washbourne",avatar:"🏆",text:"I don't play characters. I become them. Script is just the skeleton.",likes:14500,time:"5h"},
  {user:"Hans Zimmermann",avatar:"🎼",text:"A film score shouldn't be heard. It should be felt.",likes:8900,time:"2h"},
];

/* ─── HELPERS ─── */
const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const fmt=n=>"$"+Math.abs(+n).toFixed(1)+"M";
const fmtBig=n=>Math.abs(n)>=1000?"$"+(n/1000).toFixed(1)+"B":"$"+(+n).toFixed(1)+"M";
const fmtK=n=>n>=1000000?(n/1000000).toFixed(1)+"M":n>=1000?(n/1000).toFixed(0)+"K":String(n);
const absW=(yr,sy,wk)=>(yr-sy)*52+wk;
function calcBO(script,cast,studio,budget){
  if(!cast.length)return 0;
  const avg=cast.reduce((a,b)=>a+b.skill*.5+b.fame*.5,0)/cast.length;
  const match=cast.filter(a=>a.genres.includes(script.genre)).length/cast.length;
  const mult=studio?.id==="marvel_c"?2.5:studio?.id==="disney_c"?1.8:1.4;
  return Math.round((script.quality/100)*(avg/100)*budget*mult*(1+match*.5)*(0.75+Math.random()*.65)*10)/10;
}
const weekRev=(bo,wo)=>wo<1||wo>14?0:Math.round(bo*.15*Math.pow(.70,wo-1)*10)/10;
function repTier(r){
  if(r>=90)return{label:"Legend",color:"#ffd700",bg:"linear-gradient(135deg,#2e2000,#1a1200)"};
  if(r>=75)return{label:"A-List",color:"#9d6fff",bg:"linear-gradient(135deg,#1e0e36,#130824)"};
  if(r>=55)return{label:"Rising",color:"#4caf8a",bg:"linear-gradient(135deg,#081e14,#041008)"};
  if(r>=35)return{label:"Known",color:"#4b9de8",bg:"linear-gradient(135deg,#081422,#040c16)"};
  return{label:"Unknown",color:"#666",bg:"linear-gradient(135deg,#121020,#0c0a16)"};
}

/* ─── UI ATOMS ─── */
const Card=({children,style,onClick,grad,accent})=>(
  <div onClick={onClick} style={{background:grad||"linear-gradient(135deg,rgba(255,255,255,.05),rgba(255,255,255,.02))",borderRadius:18,padding:16,border:"1px solid rgba(255,255,255,.07)",borderTop:accent?"2px solid "+accent:"1px solid rgba(255,255,255,.07)",cursor:onClick?"pointer":"default",...style}}>{children}</div>
);
const Lbl=({children,color})=><div style={{fontSize:10,fontWeight:700,letterSpacing:1.8,textTransform:"uppercase",color:color||"#444",marginBottom:6}}>{children}</div>;
const PBtn=({children,onClick,disabled,style})=>(
  <button onClick={disabled?undefined:onClick} style={{width:"100%",padding:15,background:disabled?"#1a1828":"linear-gradient(135deg,#9d6fff,#ff6b9d)",color:disabled?"#444":"#fff",border:"none",borderRadius:14,fontWeight:800,fontSize:15,boxShadow:disabled?"none":"0 4px 18px rgba(157,111,255,.28)",...style}}>{children}</button>
);
const SBtn=({children,onClick,disabled,color})=>(
  <button onClick={disabled?undefined:onClick} disabled={disabled} style={{padding:"8px 14px",background:disabled?"rgba(255,255,255,.03)":color||"rgba(255,255,255,.09)",color:disabled?"#333":"#e0d8f8",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,fontWeight:600,fontSize:13,whiteSpace:"nowrap"}}>{children}</button>
);
const StatBar=({label,value,max,color})=>{
  const pct=Math.min(100,Math.max(0,(value/max)*100));
  return(
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#555",fontWeight:600,marginBottom:4}}><span>{label}</span><span style={{color}}>{max===100?value:fmtBig(value)}</span></div>
      <div style={{height:5,background:"rgba(255,255,255,.06)",borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:pct+"%",background:`linear-gradient(90deg,${color},${color}88)`,borderRadius:3}}/>
      </div>
    </div>
  );
};
const GenrePill=({genre})=>{const c=GENRE_COLORS[genre]||"#888";return <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:c+"18",color:c,border:"1px solid "+c+"28",fontWeight:700,letterSpacing:.5,marginRight:4,textTransform:"uppercase"}}>{genre}</span>;};
const Toast=({msg,type})=>{
  if(!msg)return null;
  const P={gold:{bg:"rgba(255,215,0,.14)",br:"rgba(255,215,0,.35)",c:"#ffd700"},green:{bg:"rgba(76,175,138,.14)",br:"rgba(76,175,138,.35)",c:"#4caf8a"},error:{bg:"rgba(224,80,80,.14)",br:"rgba(224,80,80,.35)",c:"#e05050"},warn:{bg:"rgba(224,144,64,.14)",br:"rgba(224,144,64,.35)",c:"#e09040"}};
  const t=P[type]||{bg:"rgba(255,255,255,.08)",br:"rgba(255,255,255,.2)",c:"#ccc"};
  return <div className="au" style={{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",zIndex:2000,background:t.bg,border:"1px solid "+t.br,color:t.c,padding:"9px 20px",borderRadius:30,fontSize:13,fontWeight:700,whiteSpace:"nowrap",maxWidth:"88vw",textAlign:"center"}}>{msg}</div>;
};
const Sheet=({title,icon,onClose,children})=>(
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.78)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
    <div className="as" onClick={e=>e.stopPropagation()} style={{background:"#0f0e1a",borderRadius:"22px 22px 0 0",width:"min(480px,100%)",maxHeight:"88vh",overflowY:"auto",paddingBottom:32}}>
      <div style={{display:"flex",justifyContent:"center",padding:"10px 0 4px"}}><div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,.14)"}}/></div>
      <div style={{position:"sticky",top:0,background:"#0f0e1a",padding:"8px 20px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>{icon&&<span style={{fontSize:18}}>{icon}</span>}<span style={{fontWeight:800,fontSize:17,fontFamily:"'Syne',sans-serif",color:"#f0eeff"}}>{title}</span></div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,.08)",border:"none",color:"#aaa",width:30,height:30,borderRadius:"50%",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div>
      <div style={{padding:"12px 20px 0"}}>{children}</div>
    </div>
  </div>
);
const Row=({icon,left,sub,right,accent})=>(
  <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
    {icon!=null&&<div style={{width:42,height:42,borderRadius:13,background:accent||"rgba(157,111,255,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</div>}
    <div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:14,color:"#f0eeff"}}>{left}</div>{sub&&<div style={{fontSize:12,color:"#555",marginTop:2,lineHeight:1.4}}>{sub}</div>}</div>
    {right}
  </div>
);

/* ─── MAIN APP ─── */
export default function App(){
  const [phase,setPhase]=useState("splash1");
  const [splashOut,setSplashOut]=useState(false);
  const [dirName,setDirName]=useState("");
  const [gender,setGender]=useState(null);
  const [charAge,setCharAge]=useState(28);
  const [skillId,setSkillId]=useState(null);
  const [protegeId,setProtegeId]=useState(null);
  const [natId,setNatId]=useState(null);
  const [indId,setIndId]=useState(null);
  const [startYear,setStartYear]=useState(2025);
  const [money,setMoney]=useState(30);
  const [rep,setRep]=useState(20);
  const [year,setYear]=useState(2025);
  const [week,setWeek]=useState(1);
  const [films,setFilms]=useState([]);
  const [awards,setAwards]=useState(0);
  const [roster,setRoster]=useState([]);
  const [deal,setDeal]=useState(null);
  const [script,setScript]=useState(null);
  const [cast,setCast]=useState([]);
  const [prodBudget,setProdBudget]=useState(20);
  const [loans,setLoans]=useState([]);
  const [attended,setAttended]=useState([]);
  const [log,setLog]=useState([]);
  const [revLog,setRevLog]=useState([]);
  const [lastFilm,setLastFilm]=useState(null);
  const [nav,setNav]=useState("home");
  const [sheet,setSheet]=useState(null);
  const [popup,setPopup]=useState(null);
  const [newsIdx,setNewsIdx]=useState(0);
  const [moneyHist,setMoneyHist]=useState([{w:0,v:30}]);
  const [toastMsg,setToastMsg]=useState(null);
  const [toastType,setToastType]=useState(null);
  const [milestone,setMilestone]=useState(null);
  const [totalWeeks,setTotalWeeks]=useState(0);
  const [ownedItems,setOwnedItems]=useState([]);
  const [ownedBiz,setOwnedBiz]=useState([]);
  const [shopCat,setShopCat]=useState("All");
  const [socialPlatforms,setSocialPlatforms]=useState(SOCIAL_PLATFORMS.map(p=>({...p})));
  const [signedContracts,setSignedContracts]=useState([]);
  const [weekLoading,setWeekLoading]=useState(false);
  const [seizedMsg,setSeizedMsg]=useState(null);
  const [dailyLife,setDailyLife]=useState(null);
  const [likedPosts,setLikedPosts]=useState({});
  const [wikiOpen,setWikiOpen]=useState(false);
  const logRef=useRef(null);
  const toastTmr=useRef(null);
  const pendingLogs=useRef([]);

  // Splash auto-advance
  useEffect(()=>{
    if(phase==="splash1"){
      const t1=setTimeout(()=>setSplashOut(true),2200);
      const t2=setTimeout(()=>{setSplashOut(false);setPhase("splash2");},2800);
      return()=>{clearTimeout(t1);clearTimeout(t2);};
    }
    if(phase==="splash2"){
      const t1=setTimeout(()=>setSplashOut(true),2400);
      const t2=setTimeout(()=>{setSplashOut(false);setPhase("intro");},3000);
      return()=>{clearTimeout(t1);clearTimeout(t2);};
    }
  },[phase]);

  // News ticker
  useEffect(()=>{
    const t=setInterval(()=>setNewsIdx(i=>(i+1)%6),3800);
    return()=>clearInterval(t);
  },[]);

  useEffect(()=>{ if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight; },[log]);

  const nat=useMemo(()=>NATS.find(n=>n.id===natId),[natId]);
  const ind=useMemo(()=>INDS.find(i=>i.id===indId),[indId]);
  const tier=useMemo(()=>repTier(rep),[rep]);
  const trending=useMemo(()=>
    [...films].map(f=>({name:f.title.length>11?f.title.slice(0,10)+"…":f.title,score:Math.round(f.bo+f.awards*12),bo:f.bo,genre:f.genre}))
      .sort((a,b)=>b.score-a.score).slice(0,6)
  ,[films]);
  const myAssets=useMemo(()=>SHOP_ITEMS.filter(i=>ownedItems.includes(i.id)),[ownedItems]);
  const myBiz=useMemo(()=>BIZ_ITEMS.filter(b=>ownedBiz.includes(b.id)),[ownedBiz]);
  const weeklyBizIncome=useMemo(()=>myBiz.reduce((a,b)=>a+b.weeklyIncome,0),[myBiz]);
  const netWorth=useMemo(()=>+(money+myAssets.reduce((a,b)=>a+b.price,0)+myBiz.reduce((a,b)=>a+b.price,0)).toFixed(1),[money,myAssets,myBiz]);
  const totalFollowers=useMemo(()=>socialPlatforms.reduce((a,b)=>a+b.followers,0),[socialPlatforms]);
  const curMonth=MONTHS[Math.floor(((week-1)/52)*12)];

  function qLog(msg,type){pendingLogs.current.push({msg,type:type||"info",id:Date.now()+Math.random()});}
  function flushLogs(){if(!pendingLogs.current.length)return;const b=[...pendingLogs.current];pendingLogs.current=[];setLog(l=>[...l.slice(-50),...b]);}
  function showToast(msg,type){clearTimeout(toastTmr.current);setToastMsg(msg);setToastType(type);toastTmr.current=setTimeout(()=>{setToastMsg(null);setToastType(null);},2500);}
  function applyRep(delta){
    setRep(prev=>{
      const nr=Math.min(100,Math.max(0,prev+delta));
      if(MILESTONES[nr])setMilestone({title:MILESTONES[nr]});
      return nr;
    });
  }

  function beginGame(){
    const n=nat||{mB:0,rB:0};const i=ind||{mB:0,rB:0};
    const sk=CHAR_SKILLS.find(s=>s.id===skillId)||{statBonus:{rep:0,money:0}};
    const pr=PROTEGES.find(p=>p.id===protegeId)||{statBonus:{rep:0,money:0}};
    const m=30+n.mB+i.mB+sk.statBonus.money+pr.statBonus.money;
    const r=20+n.rB+i.rB+sk.statBonus.rep+pr.statBonus.rep;
    setMoney(m);setRep(r);setYear(startYear);setWeek(1);
    setFilms([]);setAwards(0);setRoster([]);setDeal(null);setScript(null);setCast([]);setProdBudget(20);
    setLoans([]);setAttended([]);setLog([]);setRevLog([]);setLastFilm(null);
    setMoneyHist([{w:0,v:m}]);setTotalWeeks(0);setOwnedItems([]);setOwnedBiz([]);
    setSignedContracts([]);setSocialPlatforms(SOCIAL_PLATFORMS.map(p=>({...p})));setLikedPosts({});
    setMilestone(null);pendingLogs.current=[];
    qLog("🎬 Welcome, Director "+dirName+"!","gold");flushLogs();
    setPhase("game");
  }

  function takeLoan(loan){
    if(rep<loan.minRep){showToast("Need "+loan.minRep+" rep.","error");return;}
    const repay=+(loan.amount*(1+loan.interest)).toFixed(1);
    const dueAbs=absW(year,startYear,week)+loan.term;
    setMoney(m=>+(m+loan.amount).toFixed(1));
    setLoans(l=>[...l,{...loan,repay,dueAbs}]);
    qLog("💳 "+loan.name+": +"+fmt(loan.amount)+". Repay "+fmt(repay)+" in 52wk. NON-PAYMENT = SEIZURE.","warn");
    flushLogs();showToast("+"+fmt(loan.amount)+" borrowed 💳","warn");setSheet(null);
  }

  function advance(){
    if(weekLoading)return;
    setWeekLoading(true);
    setTimeout(()=>doAdvance(),2000);
  }

  function doAdvance(){
    const na=absW(year,startYear,week)+1;
    const nw=week>=52?1:week+1;
    const ny=week>=52?year+1:year;
    let delta=0;
    const remLoans=[];

    // Seizure check
    for(const l of loans){
      if(l.dueAbs<=na){
        setOwnedItems([]);setOwnedBiz([]);setMoney(5);setLoans([]);
        qLog("🏦 SEIZURE: "+l.name+" — bank took everything!","error");flushLogs();
        setSeizedMsg(l.name+" loan expired. Bank seized ALL assets. You have $5M left.");
        setWeekLoading(false);setWeek(nw);if(week>=52)setYear(ny);setTotalWeeks(t=>t+1);
        return;
      }
      if(l.dueAbs>na)remLoans.push(l);
    }

    for(const f of films){const r=weekRev(f.bo,na-f.absW);if(r>0){delta+=r;setRevLog(rv=>[{title:f.title,amount:r},...rv].slice(0,20));}}
    if(weeklyBizIncome>0)delta+=weeklyBizIncome;
    setSocialPlatforms(prev=>prev.map(p=>({...p,followers:Math.round(p.followers+p.baseGain*(0.5+Math.random())*(rep/50))})));

    const cerFound=CEREMONIES.find(c=>c.week===nw&&rep>=c.minRep&&!attended.includes(c.id+"_"+ny));
    let meetingFound=null,routineEvt=null,dailyEvt=null,repDelta=0;
    if(!cerFound){
      if(Math.random()<.22){const el=MEETINGS.filter(m=>rep>=m.minRep);if(el.length)meetingFound=el[rnd(0,el.length-1)];}
      if(!meetingFound&&Math.random()<.3)dailyEvt=DAILY_EVENTS[rnd(0,DAILY_EVENTS.length-1)];
      if(!meetingFound&&!dailyEvt){routineEvt=WEEK_EVENTS[rnd(0,WEEK_EVENTS.length-1)];if(routineEvt.money)delta+=routineEvt.money;repDelta=routineEvt.rep;}
    }

    const newMoney=+(money+delta).toFixed(1);
    setMoney(newMoney);
    setMoneyHist(h=>[...h.slice(-23),{w:na,v:newMoney}]);
    setLoans(remLoans);
    if(week>=52){setYear(ny);qLog("🗓 "+ny+" begins.","gold");}
    setWeek(nw);setTotalWeeks(t=>t+1);
    if(routineEvt&&repDelta!==0)applyRep(repDelta);
    if(routineEvt)qLog(routineEvt.icon+" Wk "+nw+": "+routineEvt.msg,repDelta>0||routineEvt.money>0?"green":repDelta<0||routineEvt.money<0?"error":"info");
    flushLogs();
    setWeekLoading(false);
    if(dailyEvt){setDailyLife(dailyEvt);return;}
    if(cerFound){setPopup({type:"ceremony",data:cerFound,cerYear:ny});return;}
    if(meetingFound){setPopup({type:"meeting",data:meetingFound});return;}
  }

  function resolveM(i){
    if(!popup)return;
    const d=popup.data;
    if(i===0){
      if(d.cost>0&&money<d.cost){showToast("Can't afford.","error");setPopup(null);return;}
      let m2=money;if(d.cost>0)m2=+(m2-d.cost).toFixed(1);if(d.moneyGain>0)m2=+(m2+d.moneyGain).toFixed(1);
      setMoney(m2);applyRep(d.repGain);showToast(d.res[0],"green");
    }
    qLog(d.icon+" "+d.title+": "+d.res[i],i===0?"green":"info");flushLogs();setPopup(null);
  }
  function resolveC(attend){
    if(!popup)return;
    const d=popup.data;const cy=popup.cerYear||year;
    if(attend){
      const won=rep>70?rnd(0,3):0;
      if(d.moneyGain>0)setMoney(m=>+(m+d.moneyGain).toFixed(1));
      applyRep(d.repGain);if(won>0)setAwards(a=>a+won);
      setAttended(a=>[...a,d.id+"_"+cy]);
      qLog(d.icon+" "+d.name+": Attended! +"+d.repGain+" rep"+(won>0?" 🏆×"+won:""),"gold");
      showToast(d.icon+" +"+d.repGain+" rep"+(won>0?" 🏆×"+won:""),"gold");
    }else qLog("Skipped "+d.name+".","info");
    flushLogs();setPopup(null);
  }
  function signActor(a){
    if(roster.find(r=>r.id===a.id))return;
    if(money<a.salary){showToast("Need "+fmt(a.salary)+".","error");return;}
    setMoney(m=>+(m-a.salary).toFixed(1));setRoster(r=>[...r,a]);
    qLog("✓ Signed "+a.name+".","green");flushLogs();showToast(a.emoji+" "+a.name+" signed!","green");
  }
  function releaseActor(a){setRoster(r=>r.filter(x=>x.id!==a.id));setCast(c=>c.filter(x=>x.id!==a.id));qLog("Released "+a.name+".","info");flushLogs();}
  function signDeal(s){
    if(rep<s.minRep){showToast("Need "+s.minRep+" rep.","error");return;}
    setDeal(s);qLog("🤝 Signed with "+s.name+"!","gold");flushLogs();showToast(s.name+" deal signed 🤝","gold");setSheet(null);
  }
  function buyItem(item){
    if(ownedItems.includes(item.id)){showToast("Already owned!","warn");return;}
    if(money<item.price){showToast("Need "+item.label+".","error");return;}
    setMoney(m=>+(m-item.price).toFixed(1));setOwnedItems(p=>[...p,item.id]);applyRep(item.rep);
    qLog(item.emoji+" Bought "+item.name,"gold");flushLogs();showToast(item.emoji+" "+item.name+" is yours!","gold");
  }
  function buyBiz(biz){
    if(ownedBiz.includes(biz.id)){showToast("Already owned!","warn");return;}
    if(money<biz.price){showToast("Need "+biz.label+".","error");return;}
    setMoney(m=>+(m-biz.price).toFixed(1));setOwnedBiz(p=>[...p,biz.id]);
    qLog(biz.emoji+" Acquired "+biz.name+" — earns "+fmt(biz.weeklyIncome)+"/wk","gold");flushLogs();showToast(biz.emoji+" "+biz.name+" acquired!","gold");
  }
  function signContract(c){
    if(rep<c.minRep){showToast("Need "+c.minRep+" rep.","error");return;}
    if(films.length<c.minFilms){showToast("Need "+c.minFilms+" films.","error");return;}
    if(signedContracts.find(s=>s.id===c.id)){showToast("Already signed!","warn");return;}
    applyRep(c.repGain);setMoney(m=>+(m+c.moneyGain).toFixed(1));
    setSignedContracts(p=>[...p,{...c,signedYear:year}]);
    setDeal({id:c.id,name:c.studio,budget:c.budget,bonus:c.perks[0]});
    qLog("📋 CONTRACT: "+c.studio+" signed!","gold");flushLogs();showToast("📋 "+c.studio+"! +$"+c.moneyGain+"M","gold");
  }
  function produce(){
    if(!script){showToast("Select a script first.","error");return;}
    if(!cast.length){showToast("Cast at least one actor.","error");return;}
    const safeB=Math.min(prodBudget,Math.floor(money));
    const cost=+(safeB+script.cost).toFixed(1);
    if(money<cost){showToast("Need "+fmt(cost)+".","error");return;}
    const bo=calcBO(script,cast,deal,safeB+(deal?deal.budget:0));
    const won=(script.quality>85&&bo>40)?rnd(1,4):bo>60?rnd(0,2):0;
    const profit=+(bo-cost).toFixed(1);const opening=+(bo*.28).toFixed(1);
    applyRep(Math.round(bo/18+won*5+(profit>0?4:-8)));
    setMoney(m=>+(m-cost+opening).toFixed(1));setAwards(a=>a+won);setDeal(null);
    const film={title:script.title,genre:script.genre,year,bo,budget:cost,profit,awards:won,studio:deal?.name||"Independent",cast:cast.map(a=>a.name),absW:absW(year,startYear,week),emoji:script.emoji};
    setFilms(p=>[film,...p]);setLastFilm(film);
    qLog("🎬 \""+film.title+"\" opens! Weekend: +"+fmt(opening),"green");
    if(won>0)qLog("🏆 "+won+" award"+(won>1?"s":"")+"!","gold");
    flushLogs();setScript(null);setCast([]);setProdBudget(20);setSheet(null);setPhase("postrelease");
  }
  function doPremiere(p){
    if(money<p.cost){showToast("Need "+fmt(p.cost)+".","error");return;}
    setMoney(m=>+(m-p.cost+p.moneyGain).toFixed(1));applyRep(p.repGain);
    qLog(p.icon+" "+p.name+"! +"+p.repGain+" rep","gold");flushLogs();showToast(p.icon+" "+p.name+"!","gold");setPhase("game");
  }

  // ── SPLASH 1 ──
  if(phase==="splash1")return(
    <div style={{minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",opacity:splashOut?0:1,transition:splashOut?"opacity .6s ease":"none"}}>
      <style>{CSS}</style>
      <div className="si" style={{width:80,height:80,borderRadius:24,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,marginBottom:24}}>👑</div>
      <div className="si" style={{fontWeight:900,fontSize:28,letterSpacing:4,color:"#fff",textTransform:"uppercase"}}>DOMINION</div>
      <div className="si" style={{fontSize:11,color:"rgba(255,255,255,.35)",letterSpacing:8,textTransform:"uppercase",marginTop:6}}>PRODUCTIONS</div>
      <div style={{marginTop:18,width:120,height:1,background:"rgba(255,255,255,.15)",overflow:"hidden"}}>
        <div className="wb" style={{height:"100%",background:"rgba(255,255,255,.6)"}}/>
      </div>
    </div>
  );

  // ── SPLASH 2 ──
  if(phase==="splash2")return(
    <div style={{minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",opacity:splashOut?0:1,transition:splashOut?"opacity .6s ease":"none"}}>
      <style>{CSS}</style>
      <div className="si" style={{fontSize:11,color:"rgba(255,255,255,.3)",letterSpacing:5,textTransform:"uppercase",marginBottom:24}}>in collaboration with</div>
      <div className="si" style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}>
        <div style={{width:12,height:44,background:"rgba(255,255,255,.9)",borderRadius:2}}/>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          <div style={{width:44,height:12,background:"rgba(255,255,255,.9)",borderRadius:2}}/>
          <div style={{width:44,height:12,background:"rgba(255,255,255,.9)",borderRadius:2}}/>
        </div>
      </div>
      <div className="si" style={{fontWeight:900,fontSize:32,letterSpacing:6,color:"#fff",textTransform:"uppercase"}}>909</div>
      <div className="si" style={{fontSize:11,color:"rgba(255,255,255,.35)",letterSpacing:8,textTransform:"uppercase",marginTop:5}}>STUDIOS</div>
    </div>
  );

  // ── INTRO ──
  if(phase==="intro")return(
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 50% 0%,#1c0a34,#07060d)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{CSS}</style>
      <div className="au" style={{width:"min(370px,100%)",textAlign:"center"}}>
        <div style={{position:"relative",width:88,height:88,margin:"0 auto 22px"}}>
          <div style={{position:"absolute",inset:-8,borderRadius:28,background:"linear-gradient(135deg,#9d6fff,#ff6b9d)",opacity:.2,filter:"blur(14px)"}}/>
          <div style={{width:88,height:88,borderRadius:24,background:"linear-gradient(135deg,#9d6fff,#ff6b9d)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,position:"relative"}}>🎬</div>
        </div>
        <div className="st" style={{fontSize:44,fontWeight:900,fontFamily:"'Syne',sans-serif",letterSpacing:-2,marginBottom:4}}>DIRECTOR</div>
        <div style={{fontSize:11,color:"#333",letterSpacing:5,textTransform:"uppercase",marginBottom:28}}>Life Simulator</div>
        <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:28}}>
          <div style={{width:22,height:4,borderRadius:2,background:"#9d6fff"}}/><div style={{width:8,height:4,borderRadius:2,background:"#1e1830"}}/><div style={{width:8,height:4,borderRadius:2,background:"#1e1830"}}/><div style={{width:8,height:4,borderRadius:2,background:"#1e1830"}}/>
        </div>
        <div style={{fontSize:14,color:"#555",marginBottom:14}}>What's your name, Director?</div>
        <input value={dirName} onChange={e=>setDirName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&dirName.trim()&&setPhase("setup_year")} placeholder="Enter your name…"
          style={{width:"100%",padding:15,background:"rgba(255,255,255,.05)",border:"1px solid rgba(157,111,255,.22)",borderRadius:13,color:"#fff",fontSize:16,outline:"none",marginBottom:13,textAlign:"center"}}/>
        <PBtn onClick={()=>dirName.trim()&&setPhase("setup_year")} disabled={!dirName.trim()}>Continue →</PBtn>
      </div>
    </div>
  );

  // ── SETUP YEAR + NAT ──
  if(phase==="setup_year")return(
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 50% 0%,#1c0a34,#07060d)",overflowY:"auto",paddingBottom:40}}>
      <style>{CSS}</style>
      <div style={{maxWidth:480,margin:"0 auto",padding:"26px 18px 0"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
          <button onClick={()=>setPhase("intro")} style={{background:"rgba(255,255,255,.07)",border:"none",color:"#aaa",padding:"7px 13px",borderRadius:10,fontSize:13}}>← Back</button>
          <div style={{display:"flex",gap:5}}><div style={{width:8,height:4,borderRadius:2,background:"#1e1830"}}/><div style={{width:22,height:4,borderRadius:2,background:"#9d6fff"}}/><div style={{width:8,height:4,borderRadius:2,background:"#1e1830"}}/><div style={{width:8,height:4,borderRadius:2,background:"#1e1830"}}/></div>
          <div style={{width:56}}/>
        </div>
        <div style={{textAlign:"center",marginBottom:20}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,marginBottom:4}}>When do you begin?</div><div style={{fontSize:13,color:"#555"}}>Choose your era</div></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:26}}>
          {START_YEARS.map(y=><button key={y} onClick={()=>setStartYear(y)} style={{padding:"14px 4px",background:startYear===y?"rgba(157,111,255,.2)":"rgba(255,255,255,.04)",border:"1.5px solid "+(startYear===y?"#9d6fff":"rgba(255,255,255,.08)"),borderRadius:13,color:startYear===y?"#fff":"#666",fontWeight:startYear===y?800:500,fontSize:15}}>{y}</button>)}
        </div>
        <div style={{textAlign:"center",marginBottom:18}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,marginBottom:4}}>Where are you from?</div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:26}}>
          {NATS.map(n=>{const sel=natId===n.id;return(
            <button key={n.id} onClick={()=>setNatId(n.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 13px",background:sel?"rgba(157,111,255,.18)":"rgba(255,255,255,.04)",border:"1.5px solid "+(sel?"#9d6fff":"rgba(255,255,255,.06)"),borderRadius:14,textAlign:"left"}}>
              <span style={{fontSize:22}}>{n.flag}</span>
              <div><div style={{fontWeight:700,fontSize:13,color:sel?"#f0eeff":"#bbb"}}>{n.label}</div><div style={{fontSize:10,color:"#444",marginTop:1}}>{n.city}</div>{(n.mB||n.rB)?<div style={{fontSize:10,color:"#9d6fff",marginTop:2}}>{n.mB>0?"+$"+n.mB+"M ":""}{n.rB>0?"+"+n.rB+" rep":""}</div>:null}</div>
            </button>
          );})}
        </div>
        <PBtn onClick={()=>natId&&setPhase("setup_industry")} disabled={!natId}>Continue →</PBtn>
      </div>
    </div>
  );

  // ── SETUP INDUSTRY ──
  if(phase==="setup_industry")return(
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 50% 0%,#1c0a34,#07060d)",overflowY:"auto",paddingBottom:40}}>
      <style>{CSS}</style>
      <div style={{maxWidth:480,margin:"0 auto",padding:"26px 18px 0"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
          <button onClick={()=>setPhase("setup_year")} style={{background:"rgba(255,255,255,.07)",border:"none",color:"#aaa",padding:"7px 13px",borderRadius:10,fontSize:13}}>← Back</button>
          <div style={{display:"flex",gap:5}}><div style={{width:8,height:4,borderRadius:2,background:"#1e1830"}}/><div style={{width:8,height:4,borderRadius:2,background:"#1e1830"}}/><div style={{width:22,height:4,borderRadius:2,background:"#9d6fff"}}/><div style={{width:8,height:4,borderRadius:2,background:"#1e1830"}}/></div>
          <div style={{width:56}}/>
        </div>
        <div style={{textAlign:"center",marginBottom:22}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,marginBottom:4}}>Pick your lane</div></div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
          {INDS.map(i=>{const sel=indId===i.id;return(
            <button key={i.id} onClick={()=>setIndId(i.id)} style={{display:"flex",alignItems:"center",gap:13,padding:15,background:sel?"rgba(157,111,255,.18)":"rgba(255,255,255,.04)",border:"1.5px solid "+(sel?"#9d6fff":"rgba(255,255,255,.06)"),borderRadius:16,textAlign:"left"}}>
              <div style={{width:48,height:48,borderRadius:14,background:sel?"rgba(157,111,255,.24)":"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:23,flexShrink:0}}>{i.icon}</div>
              <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15,color:sel?"#f0eeff":"#bbb",marginBottom:3}}>{i.label}</div><div style={{fontSize:11,color:"#555"}}>{i.mB!==0?(i.mB>0?"+$"+i.mB+"M":"-$"+Math.abs(i.mB)+"M"):""}{i.rB!==0?" · "+(i.rB>0?"+":"")+i.rB+" rep":""}</div></div>
              {sel&&<span style={{color:"#9d6fff",fontSize:20}}>✓</span>}
            </button>
          );})}
        </div>
        <PBtn onClick={()=>indId&&setPhase("setup_character")} disabled={!indId}>Continue →</PBtn>
      </div>
    </div>
  );

  // ── SETUP CHARACTER ──
  if(phase==="setup_character")return(
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 50% 0%,#1c0a34,#07060d)",overflowY:"auto",paddingBottom:40}}>
      <style>{CSS}</style>
      <div style={{maxWidth:480,margin:"0 auto",padding:"26px 18px 0"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
          <button onClick={()=>setPhase("setup_industry")} style={{background:"rgba(255,255,255,.07)",border:"none",color:"#aaa",padding:"7px 13px",borderRadius:10,fontSize:13}}>← Back</button>
          <div style={{display:"flex",gap:4}}>{[0,1,2,3].map(i=><div key={i} style={{width:i===3?22:8,height:4,borderRadius:2,background:i===3?"#9d6fff":"#1e1830"}}/>)}</div>
          <div style={{width:56}}/>
        </div>
        <div style={{textAlign:"center",marginBottom:20}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,marginBottom:4}}>Create your Director</div></div>
        {/* Avatar */}
        <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
          <div style={{width:90,height:90,borderRadius:24,background:"linear-gradient(135deg,#1e1030,#2a1040)",border:"2px solid rgba(157,111,255,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>
            {gender==="female"?"👩":gender==="male"?"👨":"🧑"}
          </div>
        </div>
        {/* Gender */}
        <div style={{fontWeight:800,fontSize:14,color:"#f0eeff",marginBottom:12}}>Who are you?</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:22}}>
          {[{id:"male",label:"Male",icon:"👨"},{id:"female",label:"Female",icon:"👩"},{id:"nonbinary",label:"Non-binary",icon:"🧑"}].map(g=>{const sel=gender===g.id;return(
            <button key={g.id} onClick={()=>setGender(g.id)} style={{padding:"14px 8px",textAlign:"center",background:sel?"rgba(157,111,255,.2)":"rgba(255,255,255,.04)",border:"1.5px solid "+(sel?"#9d6fff":"rgba(255,255,255,.07)"),borderRadius:16}}>
              <div style={{fontSize:28,marginBottom:5}}>{g.icon}</div>
              <div style={{fontSize:12,fontWeight:700,color:sel?"#f0eeff":"#888"}}>{g.label}</div>
            </button>
          );})}
        </div>
        {/* Age */}
        <div style={{marginBottom:22}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontWeight:800,fontSize:14,color:"#f0eeff"}}>How old are you?</div>
            <div style={{background:"rgba(157,111,255,.15)",border:"1px solid rgba(157,111,255,.3)",borderRadius:20,padding:"4px 14px",fontWeight:800,fontSize:18,color:"#9d6fff"}}>{charAge}</div>
          </div>
          <input type="range" min={21} max={65} value={charAge} onChange={e=>setCharAge(+e.target.value)}/>
          <div style={{marginTop:8,padding:"8px 12px",background:"rgba(255,255,255,.04)",borderRadius:10,fontSize:12,color:"#666"}}>
            {charAge<=25?"🎓 Young talent — industry underestimates you.":charAge<=35?"⚡ Prime years — hungry, connected, peaking.":charAge<=50?"🏆 Seasoned — your name carries weight.":"🎩 Veteran — legends never retire."}
          </div>
        </div>
        {/* Skills */}
        <div style={{fontWeight:800,fontSize:14,color:"#f0eeff",marginBottom:4}}>Your signature skill</div>
        <div style={{fontSize:12,color:"#555",marginBottom:12}}>Pick one. Defines how Hollywood sees you.</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:22}}>
          {CHAR_SKILLS.map(sk=>{const sel=skillId===sk.id;return(
            <button key={sk.id} onClick={()=>setSkillId(sk.id)} style={{display:"flex",alignItems:"flex-start",gap:14,padding:15,textAlign:"left",background:sel?"rgba(157,111,255,.12)":"rgba(255,255,255,.04)",border:"1.5px solid "+(sel?sk.color:"rgba(255,255,255,.06)"),borderRadius:16}}>
              <div style={{width:48,height:48,borderRadius:13,background:sel?sk.color+"22":"rgba(255,255,255,.06)",border:"1px solid "+(sel?sk.color+"44":"transparent"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{sk.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:15,color:sel?"#f0eeff":"#bbb",marginBottom:3}}>{sk.name}</div>
                <div style={{fontSize:12,color:"#555",marginBottom:6}}>{sk.desc}</div>
                {sk.bonuses.map((b,i)=><div key={i} style={{fontSize:11,color:sk.color,fontWeight:600,marginBottom:2}}>✓ {b}</div>)}
                <div style={{display:"flex",gap:8,marginTop:6}}>
                  {sk.statBonus.rep>0&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:8,background:"rgba(157,111,255,.15)",color:"#9d6fff",fontWeight:700}}>+{sk.statBonus.rep} rep</span>}
                  {sk.statBonus.money>0&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:8,background:"rgba(76,175,138,.15)",color:"#4caf8a",fontWeight:700}}>+${sk.statBonus.money}M</span>}
                </div>
              </div>
              {sel&&<span style={{color:sk.color,fontSize:20}}>✓</span>}
            </button>
          );})}
        </div>
        {/* Proteges */}
        <div style={{fontWeight:800,fontSize:14,color:"#f0eeff",marginBottom:4}}>Choose your protégé</div>
        <div style={{fontSize:12,color:"#555",marginBottom:12}}>A rising talent who joins your team from day one.</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:22}}>
          {PROTEGES.map(pr=>{const sel=protegeId===pr.id;return(
            <button key={pr.id} onClick={()=>setProtegeId(pr.id)} style={{display:"flex",alignItems:"flex-start",gap:14,padding:15,textAlign:"left",background:sel?"rgba(157,111,255,.12)":"rgba(255,255,255,.03)",border:"1.5px solid "+(sel?pr.color:"rgba(255,255,255,.06)"),borderRadius:16}}>
              <div style={{width:54,height:54,borderRadius:"50%",background:sel?pr.color+"22":"rgba(255,255,255,.06)",border:"2px solid "+(sel?pr.color+"55":"rgba(255,255,255,.08)"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{pr.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:15,color:sel?"#f0eeff":"#bbb",marginBottom:2}}>{pr.name}</div>
                <div style={{fontSize:11,color:pr.color,fontWeight:600,marginBottom:4}}>{pr.role}</div>
                <div style={{fontSize:12,color:"#666",lineHeight:1.5,marginBottom:4}}>{pr.desc}</div>
                <div style={{display:"flex",gap:8}}>
                  {pr.statBonus.rep>0&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:8,background:"rgba(157,111,255,.12)",color:"#9d6fff",fontWeight:700}}>+{pr.statBonus.rep} rep</span>}
                  {pr.statBonus.money>0&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:8,background:"rgba(76,175,138,.12)",color:"#4caf8a",fontWeight:700}}>+${pr.statBonus.money}M</span>}
                </div>
              </div>
              {sel&&<span style={{color:pr.color,fontSize:20,flexShrink:0}}>✓</span>}
            </button>
          );})}
        </div>
        <PBtn onClick={()=>gender&&skillId&&protegeId&&beginGame()} disabled={!gender||!skillId||!protegeId}>
          {!gender?"Choose your gender →":!skillId?"Pick your skill →":!protegeId?"Pick your protégé →":"🎬 Begin Career"}
        </PBtn>
      </div>
    </div>
  );

  // ── POST RELEASE ──
  if(phase==="postrelease"&&lastFilm)return(
    <div style={{minHeight:"100vh",background:"#07060d",overflowY:"auto",paddingBottom:32}}>
      <style>{CSS}</style>
      <Toast msg={toastMsg} type={toastType}/>
      <div style={{background:"linear-gradient(180deg,"+(GENRE_COLORS[lastFilm.genre]||"#9d6fff")+"22,#07060d)",padding:"34px 18px 24px",textAlign:"center"}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:3,color:GENRE_COLORS[lastFilm.genre]||"#9d6fff",textTransform:"uppercase",marginBottom:10}}>NOW PLAYING</div>
        <div style={{fontSize:44,marginBottom:8}}>{lastFilm.emoji}</div>
        <div className="au" style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,marginBottom:4}}>"{lastFilm.title}"</div>
        <div style={{fontSize:11,color:"#444",letterSpacing:2,textTransform:"uppercase"}}>{lastFilm.year} · {lastFilm.genre} · {lastFilm.studio}</div>
      </div>
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["Box Office",fmt(lastFilm.bo),"#4caf8a"],["Budget",fmt(lastFilm.budget),"#e07040"],[lastFilm.profit>=0?"Profit":"Loss",fmt(lastFilm.profit),lastFilm.profit>=0?"#4caf8a":"#e05050"],["Awards","🏆 "+lastFilm.awards,"#ffd700"]].map(([l,v,c])=>(
            <Card key={l} accent={c} style={{textAlign:"center",padding:"13px 8px"}}><Lbl color={c}>{l}</Lbl><div style={{fontSize:21,fontWeight:800,color:c}}>{v}</div></Card>
          ))}
        </div>
        <Card><Lbl>Cast</Lbl><div style={{color:"#666",fontSize:13,lineHeight:1.8}}>{lastFilm.cast.join(" · ")}</div></Card>
        <Lbl>Choose Your Premiere</Lbl>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {PREMIERES.map(p=>(
            <Card key={p.id} accent={money>=p.cost?"#9d6fff":undefined} onClick={()=>money>=p.cost&&doPremiere(p)} style={{opacity:money<p.cost?.38:1,cursor:money<p.cost?"default":"pointer",padding:14}}>
              <div style={{fontSize:26,marginBottom:6}}>{p.icon}</div>
              <div style={{fontWeight:700,fontSize:13,color:"#f0eeff",marginBottom:2}}>{p.name}</div>
              <div style={{fontSize:11,color:"#444",marginBottom:5}}>{p.venue}</div>
              <div style={{fontSize:11,color:"#4caf8a",fontWeight:600}}>Cost {fmt(p.cost)} · +{p.repGain} rep{p.moneyGain>0?" · +"+fmt(p.moneyGain):""}</div>
            </Card>
          ))}
        </div>
        <PBtn onClick={()=>setPhase("game")} style={{background:"rgba(255,255,255,.07)",boxShadow:"none",color:"#888"}}>Skip → Continue Career</PBtn>
      </div>
    </div>
  );

  // ── POPUPS ──
  function renderPopup(){
    if(!popup)return null;
    const d=popup.data;
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.82)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div className="au" style={{background:"linear-gradient(135deg,#100f1e,#14102a)",borderRadius:22,width:"min(390px,100%)",padding:26,textAlign:"center",border:"1px solid rgba(157,111,255,.18)"}}>
          <div style={{fontSize:52,marginBottom:10}}>{d.icon}</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:19,color:"#f0eeff",marginBottom:6}}>{d.name||d.title}</div>
          <div style={{color:"#555",fontSize:13,lineHeight:1.7,marginBottom:12}}>{popup.type==="ceremony"?"You've been invited to "+d.name+".":d.desc}</div>
          {popup.type==="ceremony"&&<div style={{fontSize:12,color:"#4caf8a",fontWeight:600,marginBottom:18}}>+{d.repGain} rep{d.moneyGain>0?" · +"+fmt(d.moneyGain):""}{rep>70?" · Possible awards":""}</div>}
          {popup.type==="meeting"&&(d.repGain>0||d.moneyGain>0)&&<div style={{fontSize:12,color:"#4caf8a",fontWeight:600,marginBottom:18}}>+{d.repGain} rep{d.moneyGain>0?" · +"+fmt(d.moneyGain):""}</div>}
          <div style={{display:"flex",gap:10}}>
            {popup.type==="ceremony"
              ?<><PBtn onClick={()=>resolveC(true)} style={{flex:1,padding:12,fontSize:14}}>Attend</PBtn><SBtn onClick={()=>resolveC(false)}>Skip</SBtn></>
              :d.opts.map((o,i)=>i===0?<PBtn key={i} onClick={()=>resolveM(i)} style={{flex:1,padding:12,fontSize:14}}>{o}</PBtn>:<SBtn key={i} onClick={()=>resolveM(i)}>{o}</SBtn>)}
          </div>
        </div>
      </div>
    );
  }
  function renderMilestone(){
    if(!milestone)return null;
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setMilestone(null)}>
        <div style={{background:"linear-gradient(135deg,#1e1030,#2a1828)",borderRadius:22,width:"min(330px,100%)",padding:32,textAlign:"center",border:"1px solid rgba(255,215,0,.28)"}}>
          <div style={{fontSize:54,marginBottom:10}}>🏆</div>
          <div className="gt" style={{fontFamily:"'Syne',sans-serif",fontSize:21,fontWeight:900,marginBottom:8}}>{milestone.title}</div>
          <div style={{fontSize:14,color:"#777",marginBottom:20}}>Tap to continue</div>
          <SBtn onClick={()=>setMilestone(null)}>Continue →</SBtn>
        </div>
      </div>
    );
  }
  function renderSeizure(){
    if(!seizedMsg)return null;
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div className="au" style={{background:"linear-gradient(135deg,#2e0808,#1a0404)",borderRadius:22,width:"min(380px,100%)",padding:28,textAlign:"center",border:"1px solid rgba(224,80,80,.4)"}}>
          <div style={{fontSize:54,marginBottom:10}}>🏦</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:18,color:"#e05050",marginBottom:12}}>BANK SEIZURE</div>
          <div style={{fontSize:13,color:"#aaa",lineHeight:1.7,marginBottom:20}}>{seizedMsg}</div>
          <PBtn onClick={()=>setSeizedMsg(null)} style={{background:"linear-gradient(135deg,#e05050,#c02020)"}}>I understand. Continue.</PBtn>
        </div>
      </div>
    );
  }
  function renderDailyLife(){
    if(!dailyLife)return null;
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.82)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div className="au" style={{background:"linear-gradient(135deg,#0e1e14,#0a1610)",borderRadius:22,width:"min(360px,100%)",padding:28,textAlign:"center",border:"1px solid rgba(76,175,138,.2)"}}>
          <div style={{fontSize:52,marginBottom:10}}>{dailyLife.icon}</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#f0eeff",marginBottom:8}}>Daily Life</div>
          <div style={{fontSize:14,color:"#888",lineHeight:1.7,marginBottom:16}}>{dailyLife.text}</div>
          {(dailyLife.rep!==0||dailyLife.money!==0)&&<div style={{fontSize:12,color:"#4caf8a",fontWeight:600,marginBottom:16}}>{dailyLife.rep>0?"+"+dailyLife.rep+" rep ":""}{dailyLife.money!==0?(dailyLife.money>0?"+"+fmt(dailyLife.money):fmt(dailyLife.money)):""}</div>}
          <SBtn onClick={()=>{
            if(dailyLife.rep!==0)applyRep(dailyLife.rep);
            if(dailyLife.money!==0)setMoney(m=>+(m+dailyLife.money).toFixed(1));
            qLog(dailyLife.icon+" "+dailyLife.text.slice(0,50),"info");flushLogs();
            setDailyLife(null);
          }}>That's life → Continue</SBtn>
        </div>
      </div>
    );
  }
  function renderWiki(){
    if(!wikiOpen)return null;
    const totalBO=films.reduce((a,b)=>a+b.bo,0);
    const gStr=gender==="female"?"She":gender==="male"?"He":"They";
    return(
      <div style={{position:"fixed",inset:0,background:"#07060d",zIndex:600,overflowY:"auto",maxWidth:480,margin:"0 auto"}}>
        <div style={{background:"rgba(7,6,13,.97)",padding:"12px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid rgba(255,255,255,.08)",position:"sticky",top:0,zIndex:10}}>
          <button onClick={()=>setWikiOpen(false)} style={{background:"rgba(255,255,255,.08)",border:"none",color:"#fff",width:34,height:34,borderRadius:"50%",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>←</button>
          <div style={{flex:1}}><div style={{fontWeight:800,fontSize:15,color:"#f0eeff"}}>{dirName}</div><div style={{fontSize:10,color:"#555"}}>Wikipedia — Film Director</div></div>
        </div>
        <div style={{padding:"16px 16px 40px",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"linear-gradient(135deg,#12101e,#0e0c18)",borderRadius:14,padding:16,display:"flex",gap:14}}>
            <div style={{width:80,height:100,borderRadius:14,background:"linear-gradient(135deg,#1e1030,#2a1040)",border:"2px solid rgba(157,111,255,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,flexShrink:0}}>{gender==="female"?"👩":gender==="male"?"👨":"🧑"}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:20,color:"#f0eeff",marginBottom:2}}>{dirName}</div>
              <div style={{fontSize:12,color:"#9d6fff",marginBottom:8}}>{CHAR_SKILLS.find(s=>s.id===skillId)?.name||"Film Director"}</div>
              {[["Born","Age "+charAge+" · "+(nat?.city||"LA")],["Nationality",(nat?.flag||"🌍")+" "+(nat?.label||"—")],["Industry",ind?.label||"Film"],["Active",startYear+"–present"]].map(([l,v])=>(
                <div key={l} style={{display:"flex",gap:6,fontSize:11,marginBottom:3}}><span style={{color:"#555",minWidth:80}}>{l}</span><span style={{color:"#bbb"}}>{v}</span></div>
              ))}
            </div>
          </div>
          <div style={{fontSize:14,color:"#ccc",lineHeight:1.8}}><b style={{color:"#f0eeff"}}>{dirName}</b> is a film director based in {nat?.city||"Los Angeles"}. {gStr} has directed <b style={{color:"#9d6fff"}}>{films.length} film{films.length!==1?"s":""}</b> with a total box office of <b style={{color:"#4caf8a"}}>{fmtBig(totalBO)}</b> and won <b style={{color:"#ffd700"}}>{awards} award{awards!==1?"s":""}</b>. Currently holds <b style={{color:tier.color}}>{tier.label}</b> status.</div>
          {films.length>0&&<div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:16,color:"#f0eeff",marginBottom:10,paddingBottom:6,borderBottom:"1px solid rgba(255,255,255,.08)"}}>Filmography</div>
            {films.map((f,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <div><div style={{fontSize:13,color:"#f0eeff",fontWeight:600}}>{f.emoji} "{f.title}" ({f.year})</div><div style={{fontSize:11,color:"#555"}}>{f.genre} · {f.studio}{f.awards>0?" · 🏆×"+f.awards:""}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:12,color:"#4caf8a",fontWeight:700}}>{fmt(f.bo)}</div><div style={{fontSize:11,color:f.profit>=0?"#4caf8a":"#e05050"}}>{f.profit>=0?"+":""}{fmt(f.profit)}</div></div>
              </div>
            ))}
          </div>}
          <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,padding:16}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:"#9d6fff",marginBottom:12,letterSpacing:1}}>CAREER STATISTICS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["Films",films.length],["Box Office",fmtBig(totalBO)],["Awards",awards],["Reputation",rep+"/100"],["Net Worth",fmtBig(netWorth)],["Contracts",signedContracts.length]].map(([l,v])=>(
                <div key={l} style={{background:"rgba(255,255,255,.03)",borderRadius:10,padding:"10px 12px"}}><div style={{fontSize:10,color:"#444",marginBottom:3}}>{l}</div><div style={{fontSize:15,fontWeight:800,color:"#f0eeff"}}>{v}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── HOME ──
  function renderHome(){return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",gap:10}}>
        <Card grad="linear-gradient(135deg,#10103a,#0a0a26)" accent="#9d6fff" style={{flex:1}} onClick={()=>setSheet("loans")}>
          <Lbl color="#9d6fff">Finance</Lbl>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:900,marginBottom:2}}>{fmtBig(money)}</div>
          <div style={{fontSize:10,color:"#444",marginBottom:8}}>LIQUID CASH</div>
          <div style={{paddingTop:8,borderTop:"1px solid rgba(255,255,255,.06)"}}><div style={{fontSize:10,color:"#555",marginBottom:2}}>Net Worth</div><div style={{fontSize:14,fontWeight:800,color:"#9d6fff"}}>{fmtBig(netWorth)}</div></div>
        </Card>
        <Card grad={tier.bg} accent={tier.color} style={{flex:1}}>
          <Lbl color={tier.color}>Rep · {tier.label}</Lbl>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:900,color:tier.color,marginBottom:2}}>{rep}</div>
          <div style={{fontSize:10,color:"#444",marginBottom:8}}>OUT OF 100</div>
          <div style={{paddingTop:8,borderTop:"1px solid rgba(255,255,255,.06)"}}><div style={{fontSize:12,color:"#ffd700",fontWeight:700}}>🏆 {awards} awards</div></div>
        </Card>
      </div>
      {myAssets.length>0&&(
        <Card grad="linear-gradient(135deg,#1a1208,#100c04)" accent="#ffd700" style={{padding:"14px 14px 10px"}}>
          <Lbl color="#ffd700">Your Assets</Lbl>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:4}}>
            {myAssets.map(item=>(
              <div key={item.id} style={{flexShrink:0,width:110,borderRadius:12,overflow:"hidden",border:"1px solid rgba(255,215,0,.2)",position:"relative"}}>
                <img src={item.img} alt={item.name} loading="lazy" style={{width:"100%",height:70,objectFit:"cover",display:"block"}}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 40%,rgba(0,0,0,.85) 100%)"}}/>
                <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"5px 7px"}}>
                  <div style={{fontSize:9,fontWeight:700,color:"#f0eeff",lineHeight:1.2}}>{item.name}</div>
                  <div style={{fontSize:8,color:"#ffd700"}}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {myBiz.length>0&&(
        <Card grad="linear-gradient(135deg,#0a1e10,#060e08)" accent="#4caf8a" style={{padding:"12px 14px"}}>
          <Lbl color="#4caf8a">Businesses · {fmtBig(weeklyBizIncome)}/week</Lbl>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {myBiz.map(b=><span key={b.id} style={{fontSize:11,padding:"3px 9px",borderRadius:12,background:"rgba(76,175,138,.1)",color:"#4caf8a",fontWeight:600}}>{b.emoji} {b.name} +{fmt(b.weeklyIncome)}/wk</span>)}
          </div>
        </Card>
      )}
      {moneyHist.length>2&&<Card>
        <Lbl>Funds Over Time</Lbl>
        <ResponsiveContainer width="100%" height={50}>
          <AreaChart data={moneyHist} margin={{top:2,right:2,bottom:0,left:-46}}>
            <defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9d6fff" stopOpacity={.3}/><stop offset="100%" stopColor="#9d6fff" stopOpacity={0}/></linearGradient></defs>
            <Area type="monotone" dataKey="v" stroke="#9d6fff" strokeWidth={2} fill="url(#fg)" dot={false} isAnimationActive={false}/>
            <YAxis tick={false} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:"#1a1828",border:"none",borderRadius:8,fontSize:11}} formatter={v=>[fmtBig(v),"Funds"]}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>}
      <Card grad="linear-gradient(135deg,#0e0c1e,#080a16)" accent="#4b9de8">
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(75,157,232,.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>📡</div>
          <div style={{flex:1,minWidth:0}}><Lbl color="#4b9de8">Industry News</Lbl><div style={{fontSize:13,color:"#ccc",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{["Box office records shattered 🎬","Streaming wars heat up 📡","Award season begins 🏆","Directors command record deals 💰","Festival circuit buzzing 🌴","VFX demand surges ✨"][newsIdx]}</div></div>
        </div>
      </Card>
      <Card style={{padding:"10px 14px"}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          {nat&&<span style={{fontSize:12,color:"#666"}}>{nat.flag} {nat.city}</span>}
          {ind&&<span style={{fontSize:12,color:"#666"}}>{ind.icon} {ind.label}</span>}
          <span style={{fontSize:12,color:"#666"}}>📅 {curMonth} {year}</span>
        </div>
      </Card>
      {deal&&<Card grad="linear-gradient(135deg,#081e14,#040e0a)" accent="#4caf8a"><Lbl color="#4caf8a">Active Studio Deal</Lbl><div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:17}}>{deal.name}</div><div style={{fontSize:12,color:"#555",marginTop:3}}>{deal.bonus} · Budget {fmt(deal.budget)}</div></Card>}
      {loans.length>0&&<Card grad="linear-gradient(135deg,#2e0808,#1a0404)" accent="#e05050">
        <Lbl color="#e05050">⚠ Active Loans — 1 Year Clause</Lbl>
        {loans.map((l,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"5px 0",borderBottom:"1px solid rgba(255,80,80,.08)"}}><span style={{color:"#bbb"}}>{l.name}</span><span style={{color:"#e05050",fontWeight:700}}>{fmt(l.repay)} · {l.dueAbs-absW(year,startYear,week)}wk</span></div>)}
        <div style={{fontSize:11,color:"#e05050",marginTop:6,opacity:.7}}>⚠ Non-payment = all assets seized</div>
      </Card>}
      {revLog.length>0&&<Card><Lbl color="#4caf8a">Weekly Box Office</Lbl>{revLog.slice(0,4).map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}><span style={{color:"#777",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"65%"}}>"{r.title}"</span><span style={{color:"#4caf8a",fontWeight:600}}>+{fmt(r.amount)}</span></div>)}</Card>}
      <div style={{borderRadius:20,overflow:"hidden",boxShadow:"0 6px 26px rgba(124,58,255,.32)",marginTop:4}}>
        <div onClick={!weekLoading?advance:undefined} style={{background:"linear-gradient(135deg,#7c3aff,#ff3a6e)",padding:20,cursor:weekLoading?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",userSelect:"none",WebkitTapHighlightColor:"transparent"}}>
          <div><div style={{fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",opacity:.7,marginBottom:3}}>{weekLoading?"ADVANCING...":"Finish Week "+week}</div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:24}}>{weekLoading?"Processing…":"NEXT WEEK →"}</div></div>
          <div style={{width:50,height:50,borderRadius:"50%",background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{weekLoading?"⏳":"▶"}</div>
        </div>
        {weekLoading&&<div style={{height:4,background:"rgba(255,255,255,.15)"}}><div className="wb" style={{height:"100%",background:"rgba(255,255,255,.7)"}}/></div>}
      </div>
    </div>
  );}

  // ── FILMS ──
  function renderFilms(){return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card grad="linear-gradient(135deg,#160a2a,#0c0818)" accent="#9d6fff">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><Lbl color="#9d6fff">Production</Lbl><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,marginBottom:4}}>Make a Film</div><div style={{fontSize:12,color:"#444"}}>{script?script.emoji+' "'+script.title+'"':"No script"} · {cast.length} cast</div></div>
          <button onClick={()=>setSheet("produce")} style={{padding:"11px 17px",background:"linear-gradient(135deg,#9d6fff,#c472f2)",color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:13}}>Open →</button>
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[["🎭","Actors",roster.length+" signed","actors","linear-gradient(135deg,#1a1230,#0e0c20)"],["📜","Scripts",script?'"'+script.title+'"':"Browse","scripts","linear-gradient(135deg,#081e14,#040e0a)"],["🏢","Studios",deal?deal.name:"No deal","studios","linear-gradient(135deg,#1e1018,#120a10)"],["🌟","Premiere",films.length>0?films.length+" films":"After release","premiere","linear-gradient(135deg,#1e180a,#140e06)"]].map(([icon,label,sub,key,grad])=>(
          <Card key={key} style={{cursor:"pointer",padding:14,background:grad}} onClick={()=>setSheet(key)}>
            <div style={{fontSize:26,marginBottom:8}}>{icon}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:"#f0eeff"}}>{label}</div>
            <div style={{fontSize:11,color:"#444",marginTop:2}}>{sub}</div>
          </Card>
        ))}
      </div>
      {films.length>0?(
        <Card><Lbl>Filmography</Lbl>{films.map((f,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
            <div><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:15}}>{f.emoji}</span><span style={{fontWeight:600,fontSize:14,color:"#f0eeff"}}>"{f.title}"</span></div><div style={{display:"flex",gap:5,marginTop:4,alignItems:"center"}}><GenrePill genre={f.genre}/><span style={{fontSize:11,color:"#444"}}>{f.year}</span>{f.awards>0&&<span style={{fontSize:11,color:"#ffd700"}}>🏆×{f.awards}</span>}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontWeight:700,fontSize:14,color:f.profit>=0?"#4caf8a":"#e05050"}}>{f.profit>=0?"+":""}{fmt(f.profit)}</div><div style={{fontSize:11,color:"#444"}}>BO {fmt(f.bo)}</div></div>
          </div>
        ))}</Card>
      ):<Card style={{textAlign:"center",padding:36}}><div style={{fontSize:38,marginBottom:10}}>🎬</div><div style={{color:"#444",fontSize:14}}>No films yet. Go produce!</div></Card>}
    </div>
  );}

  // ── STUDIO ──
  function renderStudio(){return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card grad="linear-gradient(135deg,#160a2a,#0c0818)" accent="#9d6fff"><Lbl color="#9d6fff">Control Room</Lbl><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,marginBottom:4}}>Your Hub</div><div style={{fontSize:13,color:"#444"}}>{deal?"Partner: "+deal.name:"No active deal"}</div></Card>
      {[["🏢","Studio Deals",deal?"Active: "+deal.name:"Sign with a major studio","studios","rgba(232,72,75,.12)"],["💳","Loan Office",loans.length+" active loan"+(loans.length!==1?"s":""),"loans","rgba(184,75,232,.12)"],["🎭","Actor Roster",roster.length+"/10 signed","actors","rgba(76,175,138,.12)"],["📋","Industry Contracts",signedContracts.length+" signed",null,"rgba(255,215,0,.12)"]].map(([icon,title,sub,key,acc])=>(
        <Card key={title} onClick={()=>key?setSheet(key):setNav("contracts")} style={{cursor:"pointer"}}><Row icon={icon} left={title} sub={sub} right={<span style={{color:"#333",fontSize:18}}>›</span>} accent={acc}/></Card>
      ))}
      {(() => {const pr=PROTEGES.find(p=>p.id===protegeId);return pr?(<Card grad="linear-gradient(135deg,#0a1e10,#060e08)" accent={pr.color}><Lbl color={pr.color}>Your Protégé</Lbl><div style={{display:"flex",gap:12,alignItems:"center"}}><div style={{width:50,height:50,borderRadius:"50%",background:pr.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{pr.emoji}</div><div><div style={{fontWeight:800,fontSize:15,color:"#f0eeff"}}>{pr.name}</div><div style={{fontSize:11,color:pr.color,marginTop:1}}>{pr.role}</div><div style={{fontSize:11,color:"#555",marginTop:3}}>{pr.desc.slice(0,60)}…</div></div></div></Card>):null;})()}
      {roster.length>0&&<Card><Lbl>Roster</Lbl>{roster.map(a=><div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:10,background:"rgba(157,111,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{a.emoji}</div><div><div style={{fontWeight:600,fontSize:14,color:"#f0eeff"}}>{a.name}</div><div style={{fontSize:11,color:"#555"}}>Skill {a.skill}</div></div></div><button onClick={()=>releaseActor(a)} style={{padding:"5px 11px",background:"rgba(224,80,80,.1)",color:"#e05050",border:"1px solid rgba(224,80,80,.2)",borderRadius:8,fontSize:11,fontWeight:600}}>Release</button></div>)}</Card>}
    </div>
  );}

  // ── SOCIAL ──
  function renderSocial(){return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card grad="linear-gradient(135deg,#1a0a30,#100620)" accent="#9d6fff"><Lbl color="#9d6fff">Total Reach</Lbl><div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:900,marginBottom:4}}>{fmtK(totalFollowers)}</div><div style={{fontSize:11,color:"#444"}}>followers across all platforms</div></Card>
      <Lbl>Your Platforms</Lbl>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {socialPlatforms.map(p=>(
          <div key={p.id} style={{background:"linear-gradient(135deg,rgba(255,255,255,.05),rgba(255,255,255,.02))",borderRadius:16,padding:13,border:"1px solid "+p.color+"28"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{width:34,height:34,borderRadius:10,background:p.color+"22",border:"1px solid "+p.color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{p.icon}</div><div style={{fontWeight:700,fontSize:12,color:"#f0eeff"}}>{p.name}</div></div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:p.color}}>{fmtK(p.followers)}</div>
            <div style={{fontSize:10,color:"#444",marginTop:2}}>+{fmtK(Math.round(p.baseGain*(rep/50)))}/wk</div>
          </div>
        ))}
      </div>
      <Lbl style={{marginTop:4}}>🎬 Industry Community</Lbl>
      <Card>
        {COMMUNITY_POSTS.map((post,i)=>(
          <div key={i} style={{padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{post.avatar}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontWeight:700,fontSize:13,color:"#f0eeff"}}>{post.user}</span><span style={{fontSize:11,color:"#444"}}>{post.time}</span></div>
                <div style={{fontSize:13,color:"#aaa",lineHeight:1.6,marginBottom:8}}>{post.text}</div>
                <div style={{display:"flex",gap:14}}>
                  <button onClick={()=>setLikedPosts(lp=>({...lp,[i]:!lp[i]}))} style={{background:"none",border:"none",fontSize:12,color:likedPosts[i]?"#ff6b9d":"#555"}}>❤ {fmtK(post.likes+(likedPosts[i]?1:0))}</button>
                  <span style={{fontSize:12,color:"#555"}}>💬 Reply</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Card>
      <div onClick={()=>setWikiOpen(true)} style={{background:"linear-gradient(135deg,#1a1208,#100c04)",border:"1px solid rgba(255,215,0,.2)",borderRadius:16,padding:16,cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:48,height:48,borderRadius:14,background:"rgba(255,215,0,.1)",border:"1px solid rgba(255,215,0,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>📖</div>
        <div style={{flex:1}}><div style={{fontWeight:800,fontSize:15,color:"#ffd700",marginBottom:2}}>{dirName} — Wikipedia</div><div style={{fontSize:12,color:"#555"}}>Full career page · Filmography · Awards · Stats</div></div>
        <span style={{color:"#ffd700",fontSize:18,opacity:.6}}>›</span>
      </div>
    </div>
  );}

  // ── SHOP ──
  function renderShop(){
    const cats=["All","Houses","Cars","Yachts","Jets","Clothes"];
    const filtered=shopCat==="All"?SHOP_ITEMS:SHOP_ITEMS.filter(i=>i.cat===shopCat);
    return(
      <div style={{display:"flex",flexDirection:"column",gap:12,paddingBottom:8}}>
        <div style={{display:"flex",gap:10}}>
          <Card grad="linear-gradient(135deg,#1a1208,#100c04)" accent="#ffd700" style={{flex:1}}><Lbl color="#ffd700">Items Owned</Lbl><div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:900,color:"#ffd700"}}>{ownedItems.length}</div></Card>
          <Card grad="linear-gradient(135deg,#0a1a28,#060e18)" accent="#4b9de8" style={{flex:1}}><Lbl color="#4b9de8">Businesses</Lbl><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,color:"#4b9de8"}}>{fmtBig(weeklyBizIncome)}/wk</div></Card>
        </div>
        <Card grad="linear-gradient(135deg,#0a1e10,#060e08)" accent="#4caf8a">
          <Lbl color="#4caf8a">💼 Buy a Business (Passive Income)</Lbl>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
            {BIZ_ITEMS.map(biz=>{const owned=ownedBiz.includes(biz.id);const can=money>=biz.price;return(
              <div key={biz.id} style={{flexShrink:0,width:140,borderRadius:12,padding:12,background:owned?"rgba(76,175,138,.08)":"rgba(255,255,255,.04)",border:"1px solid "+(owned?"rgba(76,175,138,.3)":"rgba(255,255,255,.08)")}}>
                <div style={{fontSize:22,marginBottom:4}}>{biz.emoji}</div>
                <div style={{fontWeight:700,fontSize:12,color:"#f0eeff",marginBottom:2}}>{biz.name}</div>
                <div style={{fontSize:10,color:"#4caf8a",marginBottom:8}}>+{fmt(biz.weeklyIncome)}/wk</div>
                <button onClick={()=>!owned&&can&&buyBiz(biz)} disabled={owned||!can} style={{width:"100%",padding:"6px 0",background:owned?"rgba(76,175,138,.1)":!can?"rgba(255,255,255,.04)":"linear-gradient(135deg,#4caf8a,#2e8a5a)",color:owned?"#4caf8a":!can?"#333":"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:11,cursor:owned||!can?"default":"pointer"}}>{owned?"✓ Owned":!can?"Can't afford":biz.label}</button>
              </div>
            );})}
          </div>
        </Card>
        <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4}}>
          {cats.map(c=><button key={c} onClick={()=>setShopCat(c)} style={{flexShrink:0,padding:"8px 16px",background:shopCat===c?"linear-gradient(135deg,#9d6fff,#ff6b9d)":"rgba(255,255,255,.06)",color:shopCat===c?"#fff":"#666",border:"none",borderRadius:20,fontWeight:700,fontSize:12}}>{c}</button>)}
        </div>
        {filtered.map(item=>{const owned=ownedItems.includes(item.id);const can=money>=item.price;return(
          <div key={item.id} style={{borderRadius:18,overflow:"hidden",border:owned?"1px solid rgba(255,215,0,.25)":"1px solid rgba(255,255,255,.07)",background:"linear-gradient(135deg,rgba(255,255,255,.04),rgba(255,255,255,.01))"}}>
            <div style={{position:"relative",height:165,background:"#111",overflow:"hidden"}}>
              <img src={item.img} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} loading="lazy"/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 45%,rgba(7,6,13,.9) 100%)"}}/>
              <div style={{position:"absolute",top:10,left:10,padding:"3px 9px",background:"rgba(0,0,0,.6)",borderRadius:18,fontSize:10,fontWeight:700,color:"#aaa",textTransform:"uppercase"}}>{item.cat}</div>
              {owned&&<div style={{position:"absolute",top:10,right:10,padding:"3px 9px",background:"rgba(255,215,0,.18)",border:"1px solid rgba(255,215,0,.4)",borderRadius:18,fontSize:10,fontWeight:700,color:"#ffd700"}}>OWNED ✓</div>}
              <div style={{position:"absolute",bottom:10,right:10,padding:"4px 11px",background:"rgba(0,0,0,.75)",borderRadius:18,fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:900,color:can||owned?"#fff":"#e05050"}}>{item.label}</div>
            </div>
            <div style={{padding:"12px 15px"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}><span style={{fontSize:18}}>{item.emoji}</span><span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,color:"#f0eeff"}}>{item.name}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>{item.rep>0&&<span style={{fontSize:11,padding:"3px 9px",borderRadius:12,background:"rgba(157,111,255,.15)",color:"#9d6fff",fontWeight:700}}>+{item.rep} rep</span>}</div>
                <button onClick={()=>!owned&&can&&buyItem(item)} disabled={owned||!can} style={{padding:"9px 20px",background:owned?"rgba(255,215,0,.1)":!can?"rgba(255,255,255,.05)":"linear-gradient(135deg,#9d6fff,#ff6b9d)",color:owned?"#ffd700":!can?"#444":"#fff",border:owned?"1px solid rgba(255,215,0,.3)":"none",borderRadius:12,fontWeight:800,fontSize:13,cursor:owned||!can?"default":"pointer"}}>{owned?"✓ Owned":!can?"Can't afford":"Buy Now"}</button>
              </div>
            </div>
          </div>
        );})}
      </div>
    );
  }

  // ── CONTRACTS ──
  function renderContracts(){return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card grad="linear-gradient(135deg,#1a1208,#100c04)" accent="#ffd700"><Lbl color="#ffd700">Industry Contracts</Lbl><div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>Your Deals</div><div style={{display:"flex",gap:16,marginTop:10}}><div style={{textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,color:"#ffd700"}}>{signedContracts.length}</div><div style={{fontSize:10,color:"#555"}}>SIGNED</div></div><div style={{width:1,background:"rgba(255,255,255,.08)"}}/><div style={{textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,color:"#9d6fff"}}>{rep}</div><div style={{fontSize:10,color:"#555"}}>YOUR REP</div></div><div style={{width:1,background:"rgba(255,255,255,.08)"}}/><div style={{textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,color:"#4caf8a"}}>{films.length}</div><div style={{fontSize:10,color:"#555"}}>FILMS</div></div></div></Card>
      {CONTRACTS.map(c=>{
        const signed=!!signedContracts.find(s=>s.id===c.id);
        const repOk=rep>=c.minRep;const filmsOk=films.length>=c.minFilms;const eligible=repOk&&filmsOk;
        return(
          <div key={c.id} style={{borderRadius:18,overflow:"hidden",border:signed?"1px solid rgba(76,175,138,.4)":eligible?"1px solid "+c.color+"30":"1px solid rgba(255,255,255,.07)",background:"linear-gradient(135deg,rgba(255,255,255,.04),rgba(255,255,255,.01))"}}>
            <div style={{padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:44,height:44,borderRadius:12,background:c.color+"22",border:"1px solid "+c.color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{c.icon}</div>
                <div style={{flex:1}}><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"#f0eeff"}}>{c.studio}</div><div style={{fontSize:11,color:c.color,fontWeight:600}}>{c.category}</div></div>
                {signed&&<span style={{fontSize:11,color:"#4caf8a",fontWeight:700,padding:"3px 9px",background:"rgba(76,175,138,.1)",borderRadius:12}}>✓ Active</span>}
              </div>
              <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                <div style={{fontSize:11,padding:"4px 10px",borderRadius:10,background:repOk?"rgba(76,175,138,.12)":"rgba(224,80,80,.1)",border:"1px solid "+(repOk?"rgba(76,175,138,.3)":"rgba(224,80,80,.25)"),color:repOk?"#4caf8a":"#e05050",fontWeight:600}}>{repOk?"✓":"✕"} {c.minRep} rep</div>
                <div style={{fontSize:11,padding:"4px 10px",borderRadius:10,background:filmsOk?"rgba(76,175,138,.12)":"rgba(224,80,80,.1)",border:"1px solid "+(filmsOk?"rgba(76,175,138,.3)":"rgba(224,80,80,.25)"),color:filmsOk?"#4caf8a":"#e05050",fontWeight:600}}>{filmsOk?"✓":"✕"} {c.minFilms} film{c.minFilms!==1?"s":""}</div>
                <div style={{fontSize:11,padding:"4px 10px",borderRadius:10,background:"rgba(157,111,255,.1)",border:"1px solid rgba(157,111,255,.25)",color:"#9d6fff",fontWeight:600}}>💰 ${c.budget}M</div>
              </div>
              {c.perks.map((p,i)=><div key={i} style={{fontSize:11,color:c.color,fontWeight:600,marginBottom:3}}>✓ {p}</div>)}
              <div style={{display:"flex",gap:10,marginTop:10,marginBottom:12,flexWrap:"wrap"}}>
                <span style={{fontSize:11,padding:"3px 9px",borderRadius:10,background:"rgba(255,215,0,.1)",color:"#ffd700",fontWeight:700}}>+{c.repGain} rep on sign</span>
                <span style={{fontSize:11,padding:"3px 9px",borderRadius:10,background:"rgba(76,175,138,.1)",color:"#4caf8a",fontWeight:700}}>+${c.moneyGain}M advance</span>
              </div>
              <button onClick={()=>!signed&&signContract(c)} disabled={signed||!eligible}
                style={{width:"100%",padding:13,background:signed?"rgba(76,175,138,.1)":!eligible?"rgba(255,255,255,.05)":"linear-gradient(135deg,"+c.color+","+c.color+"aa)",color:signed?"#4caf8a":!eligible?"#333":"#fff",border:signed?"1px solid rgba(76,175,138,.3)":"none",borderRadius:12,fontWeight:800,fontSize:14,cursor:signed||!eligible?"default":"pointer",boxShadow:eligible&&!signed?"0 4px 18px "+c.color+"40":"none"}}>
                {signed?"✓ Contract Active":!eligible?"🔒 Need "+Math.max(0,c.minRep-rep)+" more rep & "+Math.max(0,c.minFilms-films.length)+" more film"+(c.minFilms>1?"s":""):"Sign with "+c.studio+" →"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );}

  // ── WORLD ──
  function renderWorld(){return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card grad={tier.bg} accent={tier.color}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div><Lbl color={tier.color}>Director Profile</Lbl><div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:22,marginBottom:3}}>{dirName}</div><div style={{fontSize:12,color:"#555",marginBottom:6}}>{nat?.flag} {nat?.city} · {ind?.label}</div><span style={{padding:"4px 12px",background:tier.color+"18",border:"1px solid "+tier.color+"38",borderRadius:20,fontSize:11,color:tier.color,fontWeight:700}}>{tier.label}</span></div>
          <div style={{textAlign:"center"}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:900,color:tier.color}}>{rep}</div><div style={{fontSize:9,color:"#444"}}>REP</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#ffd700",marginTop:6}}>🏆{awards}</div><div style={{fontSize:9,color:"#444"}}>AWARDS</div></div>
        </div>
        <StatBar label="Reputation" value={rep} max={100} color={tier.color}/>
        <StatBar label="Funds" value={Math.max(0,money)} max={500} color="#9d6fff"/>
      </Card>
      {trending.length>0&&<Card grad="linear-gradient(135deg,#081e16,#040e0c)" accent="#40c090">
        <Lbl color="#40c090">Your Box Office Trending</Lbl>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={trending} margin={{top:4,right:4,bottom:4,left:-22}}>
            <XAxis dataKey="name" tick={{fill:"#444",fontSize:9}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:"#2a2840",fontSize:9}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:"#16142a",border:"1px solid #2a2a3e",borderRadius:10,fontSize:12}} labelStyle={{color:"#ffd700"}} formatter={(v,_,p)=>["BO: "+fmt(p.payload.bo),p.payload.genre]}/>
            <Bar dataKey="score" radius={[5,5,0,0]} isAnimationActive={false}>{trending.map((d,i)=><Cell key={i} fill={GENRE_COLORS[d.genre]||"#888"} opacity={.85}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>}
      <Card>
        <Lbl>Award Calendar</Lbl>
        {CEREMONIES.map(c=>{const ok=rep>=c.minRep;const done=attended.includes(c.id+"_"+year);return(
          <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.04)",opacity:ok?1:.28}}>
            <div style={{fontSize:19,width:26,textAlign:"center"}}>{c.icon}</div>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:"#f0eeff"}}>{c.name}</div><div style={{fontSize:11,color:"#444",marginTop:1}}>Wk {c.week} · +{c.repGain} rep · Min {c.minRep}</div></div>
            {done&&<span style={{fontSize:11,color:"#4caf8a",fontWeight:700}}>✓</span>}
            {!ok&&!done&&<span style={{fontSize:11,color:"#444"}}>🔒</span>}
          </div>
        );})}
      </Card>
      <Card><Lbl>Director's Log</Lbl>
        <div ref={logRef} style={{maxHeight:180,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
          {log.length===0&&<div style={{color:"#333",fontSize:13,fontStyle:"italic"}}>No entries yet.</div>}
          {[...log].reverse().map(e=><div key={e.id} style={{display:"flex",gap:6,fontSize:12,color:{gold:"#ffd700",green:"#4caf8a",error:"#e05050",warn:"#e09040",info:"#555"}[e.type]||"#555",lineHeight:1.55,paddingBottom:4,borderBottom:"1px solid rgba(255,255,255,.03)"}}><div style={{width:5,height:5,borderRadius:"50%",background:{gold:"#ffd700",green:"#4caf8a",error:"#e05050",warn:"#e09040",info:"#333"}[e.type]||"#333",flexShrink:0,marginTop:5}}/><span>{e.msg}</span></div>)}
        </div>
      </Card>
    </div>
  );}

  // ── SHEETS ──
  function renderActorsSheet(){return(
    <Sheet title="Actor Market" icon="🎭" onClose={()=>setSheet(null)}>
      {ACTORS.map(a=>{const owned=!!roster.find(r=>r.id===a.id);return(
        <Row key={a.id} icon={a.emoji} left={a.name} sub={<div><div style={{display:"flex",gap:4,marginBottom:3}}>{a.genres.map(g=><GenrePill key={g} genre={g}/>)}</div><span style={{fontSize:11,color:"#555"}}>Skill {a.skill} · Fame {a.fame}</span></div>} accent={owned?"rgba(76,175,138,.12)":"rgba(157,111,255,.1)"}
          right={<div style={{textAlign:"right",marginLeft:8}}><div style={{fontSize:11,color:"#e09040",fontWeight:600,marginBottom:5}}>{fmt(a.salary)}</div><SBtn onClick={()=>owned?releaseActor(a):signActor(a)} color={owned?"rgba(224,80,80,.12)":undefined}>{owned?"Release":"Sign"}</SBtn></div>}
        />
      );})}
    </Sheet>
  );}
  function renderStudiosSheet(){return(
    <Sheet title="Studio Deals" icon="🏢" onClose={()=>setSheet(null)}>
      {STUDIOS.map(s=>{const locked=rep<s.minRep;const active=deal?.id===s.id;return(
        <Row key={s.id} icon={s.icon} left={s.name} sub={<div><div style={{fontSize:12,color:"#555",marginBottom:4}}>{s.bonus} · Budget {fmt(s.budget)}</div></div>} accent={active?s.color+"18":locked?"rgba(255,255,255,.03)":"rgba(255,255,255,.05)"}
          right={<SBtn disabled={locked} onClick={()=>{if(!locked){signDeal(s);setSheet(null);}}} color={active?s.color+"18":undefined}>{active?"Active ✓":locked?"🔒"+s.minRep:"Sign"}</SBtn>}
        />
      );})}
    </Sheet>
  );}
  function renderScriptsSheet(){return(
    <Sheet title="Script Library" icon="📜" onClose={()=>setSheet(null)}>
      {SCRIPTS.map(s=>{const chosen=script?.title===s.title;return(
        <Row key={s.title} icon={s.emoji} left={s.title} sub={<div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}><GenrePill genre={s.genre}/><span style={{fontSize:11,color:"#444"}}>Quality {s.quality}/100 · Cost {fmt(s.cost)}</span></div>} accent={chosen?"rgba(157,111,255,.14)":"rgba(255,255,255,.03)"}
          right={<SBtn onClick={()=>{setScript(s);qLog("📜 Selected \""+s.title+"\"");flushLogs();setSheet(null);}} color={chosen?"rgba(157,111,255,.2)":undefined}>{chosen?"✓ Chosen":"Select"}</SBtn>}
        />
      );})}
    </Sheet>
  );}
  function renderLoansSheet(){return(
    <Sheet title="Loan Office" icon="💳" onClose={()=>setSheet(null)}>
      <div style={{background:"rgba(224,80,80,.08)",border:"1px solid rgba(224,80,80,.2)",borderRadius:12,padding:"12px 14px",marginBottom:14}}>
        <div style={{fontWeight:700,fontSize:12,color:"#e05050",marginBottom:4}}>⚠ ONE-YEAR REPAYMENT CLAUSE</div>
        <div style={{fontSize:12,color:"#aaa",lineHeight:1.6}}>All loans must be repaid within 52 weeks. Failure = seizure of ALL property, assets, and bank accounts.</div>
      </div>
      {LOANS.map(l=>{const locked=rep<l.minRep;const active=!!loans.find(a=>a.id===l.id);const repay=+(l.amount*(1+l.interest)).toFixed(1);return(
        <Row key={l.id} icon={<div style={{width:10,height:10,borderRadius:"50%",background:l.color}}/>} left={l.name} sub={"+"+fmt(l.amount)+" · Repay "+fmt(repay)+" in 52wk · "+Math.round(l.interest*100)+"% interest"+(l.minRep>0?" · Min "+l.minRep+" rep":"")} accent={active?l.color+"14":"rgba(255,255,255,.04)"}
          right={<SBtn disabled={locked||active} onClick={()=>takeLoan(l)} color={l.color+"16"}>{active?"Active":locked?"🔒"+l.minRep:"Borrow"}</SBtn>}
        />
      );})}
    </Sheet>
  );}
  function renderPremiereSheet(){return(
    <Sheet title="Hold a Premiere" icon="🌟" onClose={()=>setSheet(null)}>
      {films.length===0?<div style={{color:"#444",fontSize:14,textAlign:"center",padding:24}}>Release a film first.</div>:<>
        <div style={{color:"#555",fontSize:13,marginBottom:14}}>Premiere for: <b style={{color:"#ffd700"}}>"{films[0].title}"</b></div>
        {PREMIERES.map(p=><Row key={p.id} icon={p.icon} left={p.name} sub={p.venue+" · +"+p.repGain+" rep"+(p.moneyGain>0?" · +"+fmt(p.moneyGain):"")} right={<SBtn disabled={money<p.cost} onClick={()=>{doPremiere(p);setSheet(null);}} color="rgba(76,175,138,.14)">{money<p.cost?"Can't afford":fmt(p.cost)}</SBtn>}/>)}
      </>}
    </Sheet>
  );}
  function renderProduceSheet(){
    const sliderMax=Math.max(5,Math.min(300,Math.floor(money)));
    const safe=Math.min(prodBudget,sliderMax);
    return(
      <Sheet title="Start Production" icon="🎬" onClose={()=>setSheet(null)}>
        <Lbl>Script</Lbl>
        {script?<Card grad="linear-gradient(135deg,#081e14,#040e0a)" accent="#4caf8a" style={{marginBottom:16,padding:12}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>{script.emoji}</span><div><div style={{fontWeight:700,fontSize:15,color:"#f0eeff"}}>"{script.title}"</div><div style={{display:"flex",gap:6,marginTop:3}}><GenrePill genre={script.genre}/><span style={{fontSize:12,color:"#555"}}>Quality {script.quality}/100</span></div></div></div></Card>
        :<div style={{marginBottom:16}}><SBtn onClick={()=>{setSheet(null);setTimeout(()=>setSheet("scripts"),60)}}>Browse Scripts →</SBtn></div>}
        <Lbl>Cast ({cast.length} selected)</Lbl>
        {roster.length===0?<div style={{marginBottom:16}}><SBtn onClick={()=>{setSheet(null);setTimeout(()=>setSheet("actors"),60)}}>Sign Actors First →</SBtn></div>
        :<div style={{marginBottom:16}}>{roster.map(a=>{const sel=!!cast.find(c=>c.id===a.id);return(
          <div key={a.id} onClick={()=>setCast(p=>sel?p.filter(c=>c.id!==a.id):[...p,a])} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 13px",marginBottom:6,borderRadius:13,background:sel?"rgba(76,175,138,.08)":"rgba(255,255,255,.03)",border:"1.5px solid "+(sel?"rgba(76,175,138,.28)":"rgba(255,255,255,.06)"),cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>{a.emoji}</span><span style={{fontWeight:600,fontSize:14,color:sel?"#4caf8a":"#ccc"}}>{sel?"✓ ":""}{a.name}</span></div>
            <span style={{fontSize:11,color:"#444"}}>Skill {a.skill}</span>
          </div>
        );})}</div>}
        <Lbl>Production Budget: ${safe}M</Lbl>
        <div style={{marginBottom:16}}>
          <input type="range" min={5} max={sliderMax} value={safe} onChange={e=>setProdBudget(+e.target.value)}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#333",marginTop:3}}><span>$5M</span><span>${sliderMax}M</span></div>
          {deal&&<div style={{fontSize:12,color:"#4caf8a",fontWeight:600,marginTop:8}}>+ {fmt(deal.budget)} from {deal.name}</div>}
        </div>
        <Card accent="#9d6fff" style={{marginBottom:14,padding:12}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}><span style={{color:"#555"}}>Total cost</span><span style={{fontWeight:700,color:"#e09040"}}>{fmt(safe+(script?.cost||0))}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"#555"}}>Available</span><span style={{fontWeight:700,color:"#4caf8a"}}>{fmt(money)}</span></div>
        </Card>
        <PBtn onClick={produce}>🎬 Roll Camera</PBtn>
      </Sheet>
    );
  }

  // ── MAIN GAME RENDER ──
  function renderTab(){
    if(nav==="home") return renderHome();
    if(nav==="films") return renderFilms();
    if(nav==="studio") return renderStudio();
    if(nav==="social") return renderSocial();
    if(nav==="shop") return renderShop();
    if(nav==="contracts") return renderContracts();
    return renderWorld();
  }

  return(
    <div style={{minHeight:"100vh",background:"#07060d",fontFamily:"'Inter',sans-serif",color:"#fff",maxWidth:480,margin:"0 auto",paddingBottom:82}}>
      <style>{CSS}</style>
      <Toast msg={toastMsg} type={toastType}/>
      {renderPopup()}{renderMilestone()}{renderSeizure()}{renderDailyLife()}{renderWiki()}
      {/* TOP BAR */}
      <div style={{background:"rgba(7,6,13,.97)",padding:"13px 16px 10px",position:"sticky",top:0,zIndex:200,borderBottom:"1px solid rgba(255,255,255,.05)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:40,height:40,borderRadius:13,background:"linear-gradient(135deg,#9d6fff,#ff6b9d)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🎬</div>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,lineHeight:1,display:"flex",alignItems:"center",gap:5}}>{dirName.toUpperCase()}{nat&&<span style={{fontSize:13}}>{nat.flag}</span>}{ind&&<span style={{fontSize:12}}>{ind.icon}</span>}</div>
              <div style={{fontSize:11,color:"#333",marginTop:2}}>{curMonth} {year} · Wk {week}</div>
            </div>
          </div>
          <div style={{background:"rgba(157,111,255,.1)",border:"1px solid rgba(157,111,255,.18)",borderRadius:20,padding:"8px 14px",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14}}>{fmtBig(money)}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{fontSize:9,fontWeight:700,color:tier.color,letterSpacing:.5,flexShrink:0,minWidth:40}}>{tier.label}</div>
          <div style={{flex:1,height:5,background:"rgba(255,255,255,.05)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:rep+"%",background:"linear-gradient(90deg,"+tier.color+","+tier.color+"80)",borderRadius:3}}/></div>
          <div style={{fontSize:10,fontWeight:700,color:tier.color,flexShrink:0}}>{rep}</div>
        </div>
      </div>
      {/* PAGE */}
      <div style={{padding:"16px 16px 0"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:23,marginBottom:14,letterSpacing:-.5}}>
          {nav==="home"&&"👋 Hey, "+dirName}{nav==="films"&&"🎬 Films"}{nav==="studio"&&"🎥 Studio"}{nav==="social"&&"📱 Social"}{nav==="shop"&&"🛍 Luxury Shop"}{nav==="contracts"&&"📋 Industry Deals"}{nav==="world"&&"🌍 World"}
        </div>
        {renderTab()}
      </div>
      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"min(480px,100%)",background:"rgba(7,6,13,.98)",borderTop:"1px solid rgba(255,255,255,.06)",display:"flex",overflowX:"auto",zIndex:300,padding:"8px 0 10px"}}>
        {NAV_ITEMS.map(n=>(
          <button key={n.id} onClick={()=>setNav(n.id)} style={{flex:"0 0 auto",minWidth:62,background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 8px"}}>
            <div style={{fontSize:19,filter:nav===n.id?"none":"grayscale(1)",opacity:nav===n.id?1:.32}}>{n.icon}</div>
            <div style={{fontSize:9,fontWeight:nav===n.id?700:400,color:nav===n.id?"#fff":"#444",whiteSpace:"nowrap"}}>{n.label}</div>
            {nav===n.id&&<div style={{width:5,height:5,borderRadius:"50%",background:"#9d6fff"}}/>}
          </button>
        ))}
      </div>
      {/* SHEETS */}
      {sheet==="actors"&&renderActorsSheet()}
      {sheet==="studios"&&renderStudiosSheet()}
      {sheet==="scripts"&&renderScriptsSheet()}
      {sheet==="loans"&&renderLoansSheet()}
      {sheet==="premiere"&&renderPremiereSheet()}
      {sheet==="produce"&&renderProduceSheet()}
    </div>
  );
}
