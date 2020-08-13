# AI-T3

It is AI based Tic-Tac-Toe Game giving option of both Human vs AI as well as Human vs Human. For AI to take decision <strong>MinMax Algorithm</strong> is used. 

<strong>Minimax is a kind of backtracking algorithm that is used in decision making and game theory to find the optimal move for a player, assuming that your opponent also plays optimally. It is widely used in two player turn-based games such as Tic-Tac-Toe, Backgammon, Mancala, Chess, etc.<br>
In Minimax the two players are called maximizer and minimizer. The maximizer tries to get the highest score possible while the minimizer tries to do the opposite and get the lowest score possible.Since this is a backtracking based algorithm, it tries all possible moves, then backtracks and makes a decision.<br>
Every board state has a value associated with it. In a given state if the maximizer has upper hand then, the score of the board will tend to be some positive value. If the minimizer has the upper hand in that board state then it will tend to be some negative value. The values of the board are calculated by some heuristics which are unique for every type of game.<br>
We need to implement a function that calculates the value of the board depending on the placement of pieces on the board. This function is often known as <em> Evaluation Function</em>. It is sometimes also called Heuristic Function.<br>
The evaluation function is unique for every type of game. In this post, evaluation function for the game Tic-Tac-Toe is discussed. The basic idea behind the evaluation function is to give a high value for a board if maximizer‘s turn or a low value for the board if minimizer‘s turn.</strong>

## Usage

```python
! git clone link-to-repo
Open index.html file in browser 
```

Enjoy!!
