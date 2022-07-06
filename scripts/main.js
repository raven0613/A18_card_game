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

  showGameFinished(){
    //顯示結算畫面
  }
}



const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

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
          view.renderScore(model.score+=10);
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
    console.log("GAME_STATE:" + this.currentState);
  },

  resetCards(){
    view.flipCards(...model.revealCards);
    model.revealCards = [];
    this.currentState = GAME_STATE.FirstCardAwaits;
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

controller.generateCards();


//為何不用target.matches("class")?
const cards = document.querySelectorAll(".card");
cards.forEach(card => 
  card.addEventListener("click" , function onCardClicked(e){
    controller.dispatchCardAction(card);
  }))