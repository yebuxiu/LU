function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.sharingContainer = document.querySelector(".score-sharing");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continue = function () {
  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "restart");
  }

  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var text=new Array(18);
  text[0] = " ";
  text[1] = "墨白";
  text[2] = "露露";
  text[3] = "逗逗";
  text[4] = "七月";
  text[5] = "长安";
  text[6] = "咸鱼";
  text[7] = "片片";
  text[8] = "醉秋";
  text[9] = "猫耳";
  text[10] = "馒头";
  text[11] = "明风";
  text[12] = "小天";
  text[13] = "文姬";
  text[14] = "手电";
  text[15] = "旖旎";
  text[16] = "老板";
  text[17] = "寡妇";
  var self = this;
  var text2 = function (n) { var r = 0; while (n > 1) r++, n >>= 1; return r; }

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 131072) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.innerHTML = text[text2(tile.value)];

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var mytxt=new Array(18);
  // 保留
  mytxt[0]="除非出bug";
  
  mytxt[1]="你不可能在这挂掉的！";
  
  mytxt[2]="你同样也不可能在这挂掉！";
 
  mytxt[3]="毛豆同样也没有哦！";
 
  mytxt[4]="嗷嗷嗷~";
  
  mytxt[5]="我有金闪闪！";
 
  mytxt[6]="弱者为何要战斗！";
  
  mytxt[7]="挊挊挊挊挊挊·一库~";
  
  mytxt[8]="片片我是不会告诉你QQ的！";
  
  mytxt[9]="我的阿卡丽最时尚！";
  
  mytxt[10]="我已经不屑开变声器了！";
  
  mytxt[11]="小天天~~我来啦！";
  
  mytxt[12]="小风风~~救我！！";
  
  mytxt[13]="找情缘，要花萝。";

  mytxt[14]="善恶终有报！天道好轮回！";
  
  mytxt[15]="狮虎！湿凉……";
  
  mytxt[16]="老板这渣渣不可能出现的。";
  
  mytxt[17]="寡妇逗也是~~";

  var text3 = function (m) { var r = 0; while (m > 1) r++, m >>= 1; return r; }
  var type    = won ? "game-won" : "game-over";
  var message = won ? "一群装逼的小伙伴！！" : mytxt[text3(maxscore)];

  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "end", type, this.score);
  }

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;

  this.clearContainer(this.sharingContainer);
  this.sharingContainer.appendChild(this.scoreTweetButton());
  twttr.widgets.load();
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.scoreTweetButton = function () {
  var tweet = document.createElement("a");
  tweet.classList.add("twitter-share-button");
  tweet.setAttribute("href", "https://twitter.com/share");
  tweet.setAttribute("data-via", "yebuxiu");
  tweet.setAttribute("data-url", "http://yebuxiu.github.io/LU");
  tweet.setAttribute("data-counturl", "http://yebuxiu.github.io/LU/");
  tweet.textContent = "Tweet";

  var text = "I scored " + this.score + " points at PRC2048-Full edition, a game where you " +
             "join numbers to score high! #PRC2048";
  tweet.setAttribute("data-text", text);

  return tweet;
};
