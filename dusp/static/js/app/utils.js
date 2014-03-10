define({

shuffle: function shuffle(arr){
  // this function steps backwards through an array, as it does so, it swaps
  // the current value with a randomly selected one that it hasn't yet touched.
  for (var r, x, i = arr.length; // initialization
        i;  // condition (will be true until end)
        j = parseInt( Math.random() * i),  // get random index
        i = i - 1,  // decrement
        x = arr[i], // store the current value
        arr[i] = arr[j], // set the current spot equal to the random value
        arr[j] = x // put the cuurent value into the random place
      );
    return arr;
},

trans: function trans(x, y){
  return "translate("+x+","+y+")";
},

});
