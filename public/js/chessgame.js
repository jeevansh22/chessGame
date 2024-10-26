
const socket=io()
const chess=new Chess()
const boardElement=document.querySelector('.chessboard')

//event manage krnaa hai drag ka jiski turn wo kregaaa bsss
let draggedpiece=null;
let sourceSquare=null;
let playerRole=null
const renderBoard=()=>{
    const board=chess.board()
    boardElement.innerHTML=""//pehlee seboard bnegaa to nayaa bnegaa isss line main
    board.forEach((row,rowIndex) => {
        row.forEach((square,squareIndex)=>{
            const squareElement=document.createElement('div')
            squareElement.classList.add(
                "square",
                (rowIndex+squareIndex)%2===0?"light":"dark"
            );
            squareElement.dataset.row=rowIndex
            squareElement.dataset.col=squareIndex
            if(square){
                const pieceElement=document.createElement("div")
                pieceElement.classList.add(
                    "piece",
                    square.color==="w"?"white":"black"
                )
                pieceElement.innerText=getPieceUnicode(square)
                pieceElement.draggable=playerRole===square.color
                pieceElement.addEventListener('dragstart',(e)=>{
                    if(pieceElement.draggable){
                        draggedpiece=pieceElement
                        sourceSquare={row:rowIndex,col:squareIndex}
                        e.dataTransfer.setData("text/plan","")
                    }
                })
                pieceElement.addEventListener("dragend",(e)=>{
                    draggedpiece=null;
                    sourceSquare=null
                })
                squareElement.appendChild(pieceElement)
            }
            squareElement.addEventListener("dragover",function(e){
                e.preventDefault()
            })
            squareElement.addEventListener("drop",function(e){
                e.preventDefault()
                    if(draggedpiece){
                        const targetSource={
                            row:parseInt(squareElement.dataset.row),
                            col:parseInt(squareElement.dataset.col)
                        }
                        hadnleMove(sourceSquare,targetSource)
                    }
                
            })
            boardElement.appendChild(squareElement)
        })
        
    });
    console.log(board)


} 
const hadnleMove=(source,target)=>{
    const move={
        from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion:"q",
    }
    socket.emit("move",move)
}
const getPieceUnicode=(piece)=>{
    const unicodePieces = {
        p: "♟", // Black Pawn
        r: "♜", // Black Rook
        n: "♞", // Black Knight
        b: "♝", // Black Bishop
        q: "♛", // Black Queen
        k: "♚", // Black King
        P: "♙", // White Pawn
        R: "♖", // White Rook
        N: "♘", // White Knight
        B: "♗", // White Bishop
        Q: "♕", // White Queen
        K: "♔"  // White King
    };
    return unicodePieces[piece.type]||"";
    
}
socket.on("playerRole",function(role){
    playerRole=role
    renderBoard()
})

socket.on("spectatorRole",function(){
    playerRole=null
    renderBoard()
})
socket.on("boardState",function(){
    chess.load(fen)
    renderBoard()
})

socket.on("move",function(move){
    chess.move(move)
    renderBoard()
})


renderBoard()











// socket.emit("hellllo")//ekevent bhejaaa frontend se backend pr
// socket.on("churannnn",function(){
//     console.log("received frotnned")
// })