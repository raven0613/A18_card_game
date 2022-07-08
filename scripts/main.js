// 獲取資料
// 發牌-排列方式-render畫面
// 翻開牌1-監聽事件-render被點擊的卡片-加入array
// 翻開牌2-監聽事件-render被點擊的卡片-加入array
// array>=2的時候-開始比對
// 1.兩張一樣-分數增加-清空array
// 2.兩張不同-重新render卡片-清空array

//MVC概念
//model(資料) view(畫面) controller(流程)

const GAME_STATE = {
  MemorizeTime: "MemorizeTime",
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished"
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png' , //黑陶
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png' , //愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png' , //方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' //梅花
]

const utility = {
  getRandomNumberArray(count){
    const number = Array.from(Array(count).keys());

    for(let index = number.length-1 ; index > 0 ; index--){
      let randomIndex = Math.floor(Math.random() * (index +1));
      [number[index] , number[randomIndex]] = [number[randomIndex] , number[index]];
      
    }
    return number;
  }
}




const view = {

  getWholeCard(index){
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];
    return `
      <div class="card flash" data-index="${index}">
        <p>${number}</p>
        <img src="${symbol}" alt="card">
        <p>${number}</p>
      </div>
    `
  },

  getCardElement(index){
    return `
      <div class="card back" data-index="${index}">
      </div>
    `
  },

  getCardContent(card){
    const number = this.transformNumber((card % 13) + 1);
    const symbol = Symbols[Math.floor(card / 13)];
    
    return `
        <p>${number}</p>
        <img src="${symbol}" alt="card">
        <p>${number}</p>
    `
  },

  transformNumber(number){
    switch (number){
      case 1:
        return "A"
      case 11:
        return "J"
      case 12:
        return "Q"
      case 13:
        return "K"
      default:
        return number
    }
  },

  renderCards(emptyArray){
    const rootElement = document.querySelector(".cards"); 
    rootElement.innerHTML = emptyArray.map(index => this.getCardElement(index)).join(''); 
    // rootElement.innerHTML = utility.getRandomNumberArray(52).map(index => this.getCardElement(index)).join(''); 改善前
  },

  renderWholeCards(emptyArray){
    const rootElement = document.querySelector(".cards"); 
    rootElement.innerHTML = emptyArray.map(index => this.getWholeCard(index)).join(''); 
  },

  flipCards(...cards){
    cards.map(card => {
      if (card.classList.contains("back")){
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        card.classList.remove("back");
      }
      else {
        card.innerHTML = "";
        card.classList.add("back");
      }
    })

  },

  pairCards(...cards){
    cards.map( card => {
      card.classList.add("paired");
    })
  },

  renderScore(score){
    const scoreElement = document.querySelector(".score");
    scoreElement.innerText = `score: ${score}`;
  },

  renderTriedTimes(times){
    const triedElement = document.querySelector(".tried");
    triedElement.innerText = `You've tried ${times} times`;
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add("wrong");
      card.addEventListener("animationend" , () =>{
        card.classList.remove("wrong");
      } , 
      { once: true })
    })

  },

  showGameFinished () {
    const div = document.createElement('div')
    div.classList.add('finish-panel')
    div.innerHTML = `
      <h1>Complete!</h1>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
      <button class="restart">restart</button>
    `
    container.appendChild(div);
  },
  
  closeFinishPanel(){
    //刪除finish-panel
    const finishPanel = document.querySelector('.finish-panel');
    container.removeChild(finishPanel);
  }

}




const controller = {
  currentState: GAME_STATE.MemorizeTime,

  gameStart(){
    view.renderWholeCards(utility.getRandomNumberArray(52));
    setTimeout( () => { this.gameInitialize();} , 3000);
  },

  gameInitialize(){
    const cards = document.querySelectorAll(".card");

    let cardIndex = [];
    cards.forEach(card => {
      cardIndex.push(Number(card.dataset.index));
    })
    view.renderCards(cardIndex);

    this.currentState = GAME_STATE.FirstCardAwaits;


    container.addEventListener("click" , function onContainerClicked(e){
      controller.dispatchCardAction(e.target);
    })
  },

  generateCards(){
    view.renderCards(utility.getRandomNumberArray(52));
  },

  //依照不同的GAME STATE 做不同的行為
  dispatchCardAction(card){
    if (!card.classList.contains("back")) return;

    switch(this.currentState){
      case GAME_STATE.FirstCardAwaits:
        if (model.revealCards.length >= 2) break;
        view.flipCards(card);
        model.revealCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;

      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card);
        model.revealCards.push(card);
        view.renderTriedTimes(++model.triedTimes);

        if (model.isRevealedCardsMatched()){
          //配對正確
          this.currentState = GAME_STATE.CardsMatched;
          view.pairCards(...model.revealCards);
          model.revealCards = [];
          view.renderScore(model.score += 10);

          if (model.score >= 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  // 加在這裡
            break;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        }
        else {
          //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealCards);
          setTimeout( () => { this.resetCards();} , 1000); //這樣寫的話  這邊的this 是指controller
          //或是 setTimeout(this.resetCards , 1000); 這邊的resetCard不能有()不然會失敗  這樣寫的話  這邊的this 就是指window
        }
        break;
    }
  },

  resetCards(){
    view.flipCards(...model.revealCards);
    model.revealCards = [];
    this.currentState = GAME_STATE.FirstCardAwaits;
  },

  restart(){
    this.gameStart();
    view.closeFinishPanel();
    model.revealCards = [];
    model.score = 0;
    model.triedTimes = 0;
    view.renderScore(model.score);
    view.renderTriedTimes(model.triedTimes);
    this.currentState = GAME_STATE.MemorizeTime;
  }

}






const model = {
  revealCards: [],

  isRevealedCardsMatched(){
    return this.revealCards[0].dataset.index % 13 === this.revealCards[1].dataset.index % 13;
  },

  score: 0,
  triedTimes: 0
}

controller.gameStart();


const container = document.querySelector('.container')
container.addEventListener("click" , function onContainerClicked(e){
  if(GAME_STATE.GameFinished){

    if(e.target.matches(".restart")){
      controller.restart();
    }
  }
})


