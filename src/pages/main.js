const dp = (goods, minPrice, maxPrice) => {
  const fun1 = (arr) => {
    let a = 0;
    let b = [];
    for (let i of arr) {
      a = a + i;
      b.push(i);
      if (a > minPrice) break;
    }
    let c = arr.splice(b.length);
    let d = [];
    d.push(b);
    d.push(c);
    if (a > minPrice) {
      return d;
    } else {
      return arr;
    }
  };
  let m = 0;
  const fun2 = (arr) => {
    let n = 0;
    for (let i in arr[0]) {
      n = n + arr[0][i];
    }
    for (let i = 0; i < arr[1].length; i++) {
      if (n > n - arr[0][m] + arr[1][i]) {
        if (n - arr[0][m] + arr[1][i] >= minPrice) {
          n = n - arr[0][m] + arr[1][i];
          let t = arr[0][m];
          arr[0][m] = arr[1][i];
          arr[1][i] = t;
        }
      }
    }
    if (m <= arr[0].length) {
      m++;
      return fun2(arr);
    } else {
      m = 0;
      return arr;
    }
  };

  let arr2 = [];
  const fun3 = (array) => {
    let arr = JSON.parse(JSON.stringify(array));
    if (fun1(arr) == arr) {
      arr2.push(array);
      return;
    }
    let arr1 = fun2(fun1(array));
    arr2.push(arr1[0]);
    fun3(arr1[1]);
    return;
  };

  let arr1 = [];
  for (let i = 0; i < goods.length; i++) {
    for (let j = 0; j < goods[i].nums; j++) {
      arr1.push(goods[i].price);
    }
  }
  arr1.sort((a, b) => b - a);
  fun3(arr1);

  const sum = (arr) => {
    return arr.reduce((pre, cur) => {
      return pre + cur;
    }, 0);
  };

  const fun4 = (arr) => {
    let useArr = [];
    let unUseArr = [];
    for (const item of arr) {
      if (sum(item) > maxPrice || sum(item) < minPrice) {
        unUseArr.push(item);
      } else {
        useArr.push(item);
      }
    }
    unUseArr = unUseArr.reduce((pre,cur)=>{
      if(Array.isArray(cur)){
        pre.push(...cur)
      }else{
        pre.push(cur)
      }
      return pre
    },[])
    return { 组合: useArr, 剩余组: unUseArr};
  };

  const tanXin = (arr, pMin, pMax, fRes) => {
    // 寻找满足pMin到pMax的最小值
    const find = (pMin, pMax, arr) => {
      let n = arr.length;
      const sum = arr.reduce((pre, cur) => {
        return pre + cur;
      }, 0);
      if (sum < pMin) {
        return [false, '总价不足优惠条件'];
      } else {
        let dp = [];
        let db = new Map();
        dp[0] = 1;
        for (let i = 1; i <= n; i++) {
          for (let j = sum; j >= arr[i]; j--) {
            if (dp[j - arr[i]]) {
              dp[j] = 1;
              db.set(j, arr[i]);
            }
          }
        }
        for (let i = pMin; i <= sum; i++) {
          if (dp[i]) {
            if (i > pMax) {
              return [false, '组合总价超过上限'];
            } else {
              return [true, '可以满足最低价为：', { i, db }];
            }
          }
        }
      }
    };

    // 回溯出所有条件
    const get = (num, db, res) => {
      if (num <= 0) return;
      res.push(db.get(num));
      res.push(get(num - db.get(num), db, res));
      res = res.filter((item) => typeof item === 'number');
      return res;
    };

    // 生成新数组
    const newArr = (arr, dleArr) => {
      let newarr = [...arr];
      for (var i = 0; i < dleArr.length; i++) {
        for (var j = 0; j < newarr.length; j++) {
          if (newarr[j] === dleArr[i]) {
            newarr.splice(j, 1);
            j--;
          }
        }
      }
      return newarr;
    };

    const main = (pMin, pMax, arr) => {
      let res = find(pMin, pMax, arr)
      if (res && res[0]) {
        const getRes = get(res[2].i, res[2].db, []);
        // console.log("总价："+res[2].i,"组合:"+getRes);
        fRes['组合'].push(getRes);
        main(pMin, pMax, newArr(arr, getRes));
      } else {
        fRes['剩余组'] = arr;
      }
    };
    return fRes;
  };






  let obj3 = fun4(arr2);
  return tanXin(obj3['剩余组'], minPrice, maxPrice, obj3);
};

export { dp };
