import logo from './logo.PNG';
import logo1 from './logo1.PNG';
import home from './home.PNG';
import cartLogo from './cart.PNG';
import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getStorage, ref ,uploadString,uploadBytes,getDownloadURL} from "firebase/storage";
import { collection, addDoc,query,where,getDocs } from "firebase/firestore";
import db from "./firebase";
import {storage} from './firebase';

function App() {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [userid,setUserid]=useState();
  const [dp, setDp] = useState("undefined");
  const [isLogged, setIsLogged] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isHome, setIsHome] = useState(false);
  const [file, setFile] = useState();
  const [productList, setProductList] = useState([]);
  const [isSellNewProduct, setIsSellNewProduct] = useState(false);
  const [isProductList, setIsProductList] = useState(false);
  const [isSellerData, setIsSellerData] = useState(false);
  const [sellerData, setSellerData] = useState();
  const [isCart, setIsCart] = useState(false);
  const [cart, setCart] = useState([]);
  const searchData = useRef();
  const title = useRef();
  const description = useRef();
  const price = useRef();
  const quantity = useRef();
  const category = useRef();

  const switchToHome = () => {
    if (isSellNewProduct) setIsSellNewProduct(false);
    if (isProductList) setIsProductList(false);
    if (isSellerData) setIsSellerData(false);
    if (isCart) setIsCart(false);
    fetchAllProducts();
    setIsHome(true);
  }
  const switchToSellNewProduct = () => {
    if (isHome) setIsHome(false);
    if (isProductList) setIsProductList(false);
    if (isSellerData) setIsSellerData(false);
    if (isCart) setIsCart(false);
    setIsSellNewProduct(true);
  }
  const switchToProductList = () => {
    if (isHome) setIsHome(false);
    if (isSellerData) setIsSellerData(false);
    if (isSellNewProduct) setIsSellNewProduct(false);
    if (isCart) setIsCart(false);
    setIsProductList(true);
  }
  const switchToSellerData = () => {
    if (isHome) setIsHome(false);
    if (isSellerData) setIsSellerData(false);
    if (isProductList) setIsProductList(false);
    if (isCart) setIsCart(false);
    setIsSellerData(true);
  }
  const switchToCart = () => {
    if (isHome) setIsHome(false);
    if (isSellerData) setIsSellerData(false);
    if (isProductList) setIsProductList(false);
    if (isSellerData) setIsSellerData(false);
    setIsCart(true);
  }
  const fetchSellerData = async(ThisSeller) => {
    console.log(ThisSeller);
    const idCollectionRef=collection(db,'users');
    const idq=query(idCollectionRef,where("username", "==",ThisSeller));
    const idQuerySnapshot=await getDocs(idq);
    idQuerySnapshot.forEach(idDoc=>{
      const getProductsOfSeller=async()=>{
        console.log("Going to fetch products...",idDoc.id,ThisSeller);
        const followingsCollectionRef=collection(db,`users/${idDoc.id}/products`);
        const q=query(followingsCollectionRef);
        const querySnapshot = await getDocs(q);
        const products=[];
        let index=0;
        querySnapshot.forEach((doc)=>{
          products.push({
            "id":doc.id,
            "title":doc.data().title,
            "media":doc.data().media,
            "description":doc.data().description,
            "seller":doc.data().seller,
            "price":doc.data().price,
            "quantity":doc.data().quantity,
            "category":doc.data().category
          });
          console.log(doc.id,doc.data());
          if(index>=querySnapshot.size - 1){
            // setSellerData(products);
            // switchToSellerData();

          }
          index++;
        })
        
        console.log("posts : ",products,sellerData);
        
      }
      getProductsOfSeller();
    })
  }
  const fetchAllProducts = async() => {
    const collectionRef=collection(db,`users`);
    const q = query(collectionRef);
    const querySnapshot = await getDocs(q);
    let index=0;
    const collectedProducts=[];
    querySnapshot.forEach((doc)=>{
      console.log(doc.data().username)
      const collectSellers=async()=>{
        const idCollectionRef=collection(db,'users');
        const idq=query(idCollectionRef,where("username", "==",doc.data().username));
        const idQuerySnapshot=await getDocs(idq);
        idQuerySnapshot.forEach((innerDoc)=>{
          console.log(innerDoc.data().username,innerDoc.id);
          const goIntoSellers=async()=>{
            
            const postCollectionRef=collection(db,`users/${innerDoc.id}/products`)
            const postq=query(postCollectionRef);
            const postQuerySnapshot=await getDocs(postq);
            postQuerySnapshot.forEach((postDoc)=>{
              collectedProducts.push({
                "id":postDoc.id,
                "title":postDoc.data().title,
                "media":postDoc.data().media,
                "description":postDoc.data().description,
                "seller":postDoc.data().seller,
                "price":postDoc.data().price,
                "quantity":postDoc.data().quantity,
                "category":postDoc.data().category
              });
            })
          }
          goIntoSellers();
          
        })
      }
      collectSellers();
      setTimeout(()=>{
        if(index>=querySnapshot.size-1){
          setProductList(collectedProducts);
          console.log(collectedProducts);
          switchToProductList();
        }
      },2400)
      
      index++;
    })
  }
  const submitLogin = async() => {
    const collectionRef=collection(db,"users");
    const q = query(collectionRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if(querySnapshot.size <= 0){
      alert("please enter valid data");
      return;
    }
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      setDp(doc.data().dp);
      setUserid(doc.id);
      setIsLogged(true);
      setIsHome(true);
      fetchAllProducts();
    });
    
  }
  const submitSignin =async () => {
    console.log("submit signin called");
    const docRef = await addDoc(collection(db, "users"), {
      username:username,
      password:password,
      dp:dp
    });
    console.log("Document written with ID: ", docRef.id);
    setUserid(docRef.id);
    setIsLogged(true);
    setIsHome(true);
    fetchAllProducts();
    
  }
  const handleMediaChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    alert("handle upload post called");
    console.log("handle upload post called");
    if(!file){
      alert("Please choose file");
      return;
    }
    const d=new Date();
    const nowTime=d.getHours()+'_'+d.getMinutes()+'_'+d.getSeconds();
    const nowDate=d.getFullYear()+'_'+(d.getMonth()+1)+'_'+d.getDate()+'_'+nowTime;
    const storageRef = ref(storage, `media/${username}/${file.name}_${nowDate}`);
    uploadBytes(storageRef, file).then((snapshot) => {
      console.log('Uploaded an blob or file!');
      getDownloadURL(storageRef)
      .then((url)=>{
        console.log(url);
        setFile(url)
      })
    });
  }
  const uploadDp = async(e) => {
    e.preventDefault();
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    alert("handle upload dp called");
    console.log("handle upload dp called",file);
    if(!file){
      alert("Please choose file");
      return;
    }
    const d=new Date();
    const nowTime=d.getHours()+'_'+d.getMinutes()+'_'+d.getSeconds();
    const nowDate=d.getFullYear()+'_'+(d.getMonth()+1)+'_'+d.getDate()+'_'+nowTime;
    const storageRef = ref(storage, `dp/${file.name}_${nowDate}`);
    const blob=await new Promise((resolve,reject)=>{
      const xhr=new XMLHttpRequest();
      xhr.onload=function(){
        resolve(xhr.response);
      }
      xhr.onerror=function(){
        reject(new TypeError('Netword request failed'));
      }
      xhr.responseType='blob';
      xhr.open('GET',file.name,true);
      xhr.send(null);
    })
    console.log(blob);
    
    uploadBytes(storageRef, file).then((snapshot) => {
      console.log('Uploaded an blob or file!');
      getDownloadURL(storageRef)
      .then((url)=>{
        console.log(url);
        setDp(url)
      })
    });
  }
  const uploadProduct = async() => {
    console.log("this is file", file);
    const collectionRef=collection(db,`users/${userid}/products`);
      const docRef=await addDoc(collectionRef,{
        seller: username,
        media: file,
        description: description.current.value,
        title: title.current.value,
        price: price.current.value,
        quantity: quantity.current.value,
        category: category.current.value
      });
      console.log("added document with id " + docRef.id);
      alert("uploaded post successfully");
      const lst = [];
      lst.push({
        "id":docRef.id,
        "title":docRef.data().title,
        "media":docRef.data().media,
        "description":docRef.data().description,
        "seller":docRef.data().seller,
        "price":docRef.data().price,
        "quantity":docRef.data().quantity,
        "category":docRef.data().category
      });
      setProductList(lst);
      console.log(lst);
      switchToProductList();
  }
  const buyProduct = (ThisProduct) => {
    console.log(ThisProduct);
    alert("product has Been Bought succesfully");
    switchToHome();
  }
  const addToCart = async(ThisProduct) => {
    console.log(ThisProduct);
    const collectionRef=collection(db,`users/${userid}/cart`);
    const docRef=await addDoc(collectionRef,ThisProduct);
    console.log("added document with id " + docRef.id);
    alert("added to cart successfully");
  }
  const fetchCart = async () => {
    const collectionRef=collection(db,`users/${userid}/cart`);
    const q=query(collectionRef);
    const querySnapshot = await getDocs(q);
    if(querySnapshot.size<=0){
      setCart([]);
      switchToCart();
    }
    const cartProducts=[];
    let index=0;
    querySnapshot.forEach((doc)=>{
      cartProducts.push({
        "id":doc.id,
        "title":doc.data().title,
        "media":doc.data().media,
        "description":doc.data().description,
        "seller":doc.data().seller,
        "price":doc.data().price,
        "quantity":doc.data().quantity,
        "category":doc.data().category
      });
      console.log(doc.id,doc.data(),doc.data().username,doc.data().dp);
      if(index>=querySnapshot.size - 1){
        console.log(cartProducts);
        setCart(cartProducts);
        switchToCart();
      }
      index++;
    })
  }
  const searchCategory = async(e) => {
    e.preventDefault();
    const collectionRef=collection(db,`users`);
    const q = query(collectionRef);
    const querySnapshot = await getDocs(q);
    let index=0;
    const collectedProducts=[];
    querySnapshot.forEach((doc)=>{
      console.log(doc.data().username)
      const collectSellers=async()=>{
        const idCollectionRef=collection(db,'users');
        const idq=query(idCollectionRef,where("username", "==",doc.data().username));
        const idQuerySnapshot=await getDocs(idq);
        idQuerySnapshot.forEach((innerDoc)=>{
          console.log(innerDoc.data().username,innerDoc.id);
          const goIntoSellers=async()=>{
            
            const postCollectionRef=collection(db,`users/${innerDoc.id}/products`)
            const postq=query(postCollectionRef,where("category", "==",searchData.current.value));
            const postQuerySnapshot=await getDocs(postq);
            postQuerySnapshot.forEach((postDoc)=>{
              collectedProducts.push({
                "id":postDoc.id,
                "title":postDoc.data().title,
                "media":postDoc.data().media,
                "description":postDoc.data().description,
                "seller":postDoc.data().seller,
                "price":postDoc.data().price,
                "quantity":postDoc.data().quantity,
                "category":postDoc.data().category
              });
            })
          }
          goIntoSellers();
          
        })
      }
      collectSellers();
      setTimeout(()=>{
        if(index>=querySnapshot.size-1){
          setProductList(collectedProducts);
          console.log(collectedProducts);
          switchToProductList();
        }
      },2400)
      
      index++;
    })
    
  }
  return (
    <div className="App">
      {/* <img src={logo} className="App-logo" alt="logo" /> */}

      {
        !isLogged ?
          <>
            {
              !isNewUser ?
                <>

                  <div className="container">
                    <img src={logo} className="initLogo" />
                    <div className="loginForm">

                      <center>
                        <input className="inpLogin" type="text" placeholder="username" onChange={(e) => setUsername(e.target.value)} />
                        <br />
                        <input className="inpLogin" type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
                        <br />
                        <button className="submitLoginBtn" onClick={submitLogin}>Log In</button>
                        <br />
                      </center>
                    </div>
                  </div>
                  <hr /><hr />
                  <div className="container">
                    <center>
                      <button className="switchBtn" onClick={() => setIsNewUser(true)}>Not a user? Sign in </button>

                    </center>
                  </div>
                </> :
                <>
                  <div className="container">
                    <div className="loginForm1">
                      <input classname="inpLogin1" type="file" onChange={uploadDp} />
                      <br />
                      <input classname="inpLogin" type="text" placeholder="username" onChange={(e) => setUsername(e.target.value)} />
                      <br />
                      <input classname="inpLogin" type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
                      <br />
                      <button className="submitLoginBtn1" onClick={submitSignin}>Sign In</button>
                      <br />
                    </div>
                  </div>

                  <hr /><hr />
                  <center>
                    <button className="switchBtn1" onClick={() => setIsNewUser(false)}>Already a user? Log in </button>

                  </center>
                </>
            }
          </> :
          <>
            <div className="container">
              <div className="NavBar">
                <img src={logo1} className="navLogo" />
                <form className="SearchForm" onSubmit={searchCategory}>
                  <input className="inpSearch" ref={searchData} placeholder="search category , ex: fashion" />
                </form>
                <img src={home} className="home" onClick={switchToHome} />
                <button className="sellOnAmazon" onClick={switchToSellNewProduct}>sell on amazon</button>
                <img src={cartLogo} className="cart" onClick={fetchCart} />
              </div>
            </div>
            {
              isHome ?
                <>
                  {/* <h1>i am home</h1> */}

                </> :
                <>
                </>
            }
            {
              isSellNewProduct ?
                <div className="container">
                  <h5 className="newProdHead"><u>Sell New Product</u></h5>
                  <br />
                  <br />
                  <input className="inpLogin" type="file" onChange={handleMediaChange} />
                  <br />
                  <input className="inpLogin" placeholder="title" ref={title} />
                  <br />
                  <input className="inpLogin" placeholder="description" ref={description} />
                  <br />
                  <input className="inpLogin" placeholder="price" ref={price} />
                  <br />
                  <input className="inpLogin" placeholder="quantity" ref={quantity} />
                  <br />
                  <input className="inpLogin" placeholder="category" ref={category} />
                  <br />
                  <button className="submitLoginBtn" onClick={uploadProduct} >Upload Product</button>
                </div> :
                <>
                </>
            }{
              isProductList ?
                <>
                  {console.log(productList)}
                  {
                    productList.map(product => {
                      return (
                        <div className="container">
                          <div className="product">
                            <br/>
                            <img src={product.media} className="productMedia" />
                            <div className="prod_details">
                            <span className="prod_title">{product.title}</span>
                            <br/>
                            <label className="lbl"><u>description:</u></label>&nbsp;&nbsp;
                            <br/>
                            <span className="desc">{product.description}</span>
                            <br/>
                            <label className="lbl"><u>seller:</u></label>&nbsp;&nbsp;
                            <button className="ProdsellerName" onClick={() => fetchSellerData(product.seller)}>@{product.seller}</button>
                            <br/>
                            <label className="lbl">Price : </label>
                            <span className="prod_price">{product.price} Rs</span>
                            <br/>
                            <br/>
                            <button className="buy" onClick={() => buyProduct(product)}>Buy</button>
                            <br/>
                            <button className="buy" onClick={() => addToCart(product)}>Add to cart</button>
                            <br/>
                          
                            </div>
                            </div>
                        </div>
                      )
                    })
                  }
                </> :
                <>
                </>
            }
            {
              isSellerData ?
                <>
                  <div className="container">
                    {/* <h1>sellerData</h1> */}
                    {console.log(sellerData)}
                    {/* <h1>{sellerData.dp}</h1> */}
                    {/* <img src={sellerData.dp} className="sellerDp" /> */}
                    <div className="sellerPortion">
                    <span className="sellerName">{sellerData.seller}</span>
                    <br/>
                    {
                      sellerData.products.map(product => {
                        return (
                          <div className="container">
                          <div className="product">
                            <br/>
                            <img src={product.media} className="productMedia" />
                            <div className="prod_details">
                            <span className="prod_title">{product.title}</span>
                            <br/>
                            <label className="lbl"><u>description:</u></label>&nbsp;&nbsp;
                            <br/>
                            <span className="desc">{product.description}</span>
                            <br/>
                            <label className="lbl"><u>seller:</u></label>&nbsp;&nbsp;
                            <button className="ProdsellerName" onClick={() => fetchSellerData(product.seller)}>@{product.seller}</button>
                            <br/>
                            <label className="lbl">Price : </label>
                            <span className="prod_price">{product.price} Rs</span>
                            <br/>
                            <br/>
                            <button className="buy" onClick={() => buyProduct(product)}>Buy</button>
                            <br/>
                            <button className="buy" onClick={() => addToCart(product)}>Add to cart</button>
                            <br/>
                          
                            </div>
                            </div>
                        </div>
                        )
                      })
                    }
                    </div>
                  </div>
                </> :
                <>
                </>
            }
            {
              isCart ?
                <>
                  <h1>cart</h1>
                  <div className="container">
                    {console.log(cart)}
                    {
                      cart.map(product => {
                        return (
                          <div className="container">
                          <div className="product">
                            <br/>
                            <center>
                            <img src={product.media} className="productMedia" />
                            </center>
                            <div className="prod_details">
                            <span className="prod_title">{product.title}</span>
                            <br/>
                            <label className="lbl"><u>description:</u></label>&nbsp;&nbsp;
                            <br/>
                            <span className="desc">{product.description}</span>
                            <br/>
                            <label className="lbl"><u>seller:</u></label>&nbsp;&nbsp;
                            <button className="ProdsellerName" onClick={() => fetchSellerData(product.seller)}>@{product.seller}</button>
                            <br/>
                            <label className="lbl">Price : </label>
                            <span className="prod_price">{product.price} Rs</span>
                            <br/>
                            <br/>
                            <button className="buy" onClick={() => buyProduct(product)}>Buy</button>
                            <br/>
                            <button className="buy" onClick={() => addToCart(product)}>Add to cart</button>
                            <br/>
                          
                            </div>
                            </div>
                        </div>
                        )
                      })
                    }
                  </div>
                </> :
                <>
                </>
            }
          </>
      }
    </div>
  );
}

export default App;

// import logo from './logo.PNG';
// import logo1 from './logo1.PNG';
// import home from './home.PNG';
// import cartLogo from './cart.PNG';
// import './App.css';
// import React, { useState, useEffect, useRef } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import axios from 'axios';
// function App() {
//   const [username, setUsername] = useState();
//   const [password, setPassword] = useState();
//   const [dp, setDp] = useState();
//   const [isLogged, setIsLogged] = useState(false);
//   const [isNewUser, setIsNewUser] = useState(false);
//   const [isHome, setIsHome] = useState(false);
//   const [file, setFile] = useState();
//   const [productList, setProductList] = useState([]);
//   const [isSellNewProduct, setIsSellNewProduct] = useState(false);
//   const [isProductList, setIsProductList] = useState(false);
//   const [isSellerData, setIsSellerData] = useState(false);
//   const [sellerData, setSellerData] = useState();
//   const [isCart, setIsCart] = useState(false);
//   const [cart, setCart] = useState([]);
//   const searchData = useRef();
//   const title = useRef();
//   const description = useRef();
//   const price = useRef();
//   const quantity = useRef();
//   const category = useRef();

//   const switchToHome = () => {
//     if (isSellNewProduct) setIsSellNewProduct(false);
//     if (isProductList) setIsProductList(false);
//     if (isSellerData) setIsSellerData(false);
//     if (isCart) setIsCart(false);
//     fetchAllProducts();
//     setIsHome(true);
//   }
//   const switchToSellNewProduct = () => {
//     if (isHome) setIsHome(false);
//     if (isProductList) setIsProductList(false);
//     if (isSellerData) setIsSellerData(false);
//     if (isCart) setIsCart(false);
//     setIsSellNewProduct(true);
//   }
//   const switchToProductList = () => {
//     if (isHome) setIsHome(false);
//     if (isSellerData) setIsSellerData(false);
//     if (isSellNewProduct) setIsSellNewProduct(false);
//     if (isCart) setIsCart(false);
//     setIsProductList(true);
//   }
//   const switchToSellerData = () => {
//     if (isHome) setIsHome(false);
//     if (isSellerData) setIsSellerData(false);
//     if (isProductList) setIsProductList(false);
//     if (isCart) setIsCart(false);
//     setIsSellerData(true);
//   }
//   const switchToCart = () => {
//     if (isHome) setIsHome(false);
//     if (isSellerData) setIsSellerData(false);
//     if (isProductList) setIsProductList(false);
//     if (isSellerData) setIsSellerData(false);
//     setIsCart(true);
//   }
//   const fetchSellerData = (ThisSeller) => {
//     console.log(ThisSeller);
//     const url = "http://localhost:2498/fetchSellerData";
//     const options = {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         "sellername": ThisSeller
//       })
//     }
//     fetch(url, options)
//       .then(res => res.json())
//       .then(res => {
//         if (res == "no") {
//           alert("can not show the seller data");
//         } else {
//           // alert("video uploaded succesfully");
//           console.log(res);
//           setSellerData(res);
//           switchToSellerData();
//         }
//       })
//       .catch(err => {
//         console.log(err);
//       })
//   }
//   const fetchAllProducts = () => {
//     // alert("going to fetch");
//     const url = "http://localhost:2498/fetchAllProducts";
//     const options = {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({

//       })
//     }
//     fetch(url, options)
//       .then(res => res.json())
//       .then(res => {
//         if (res == "no") {
//           alert("please reload");
//         } else {
//           console.log(res);
//           setProductList(res);
//           console.log(res);
//           switchToProductList();
//         }
//       })
//       .catch(err => {
//         console.log(err);
//       })
//   }
//   const submitLogin = () => {
//     const url = "http://localhost:2498/login";
//     const options = {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         "username": username,
//         "password": password
//       })
//     }
//     fetch(url, options)
//       .then(res => res.json())
//       .then(res => {
//         if (res == "no") {
//           alert("please enter a valid data");
//         } else {
//           setIsLogged(true);
//           setIsHome(true);
//           fetchAllProducts();
//         }
//         console.log(res);
//       })
//       .catch(err => {
//         console.log(err);
//       })
//   }
//   const submitSignin = () => {
//     const url = "http://localhost:2498/signin";
//     const options = {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         "username": username,
//         "password": password,
//         "dp": dp
//       })
//     }
//     fetch(url, options)
//       .then(res => res.json())
//       .then(res => {
//         if (res == "no") {
//           alert("please enter a valid data");
//         } else {

//           setIsLogged(true);
//           setIsHome(true);
//           fetchAllProducts();
//         }
//         console.log(res);
//       })
//       .catch(err => {
//         console.log(err);
//       })
//   }
//   const handleMediaChange = (e) => {
//     e.preventDefault();
//     const file = e.target.files[0];
//     const formData = new FormData();
//     formData.append('file', file);
//     const url = "http://localhost:2498/media";
//     console.log(formData);
//     axios.post(url, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     }).then(res => {
//       console.log(res);
//       if (res == "no") {
//         alert("please try again");
//       }
//       console.log(res.data);
//       setFile(res.data);
//     }).catch(err => {
//       console.log(err);
//     })

//     // console.log(res);

//   }
//   const uploadDp = (e) => {
//     e.preventDefault();
//     const file = e.target.files[0];
//     const formData = new FormData();
//     formData.append('file', file);
//     const url = "http://localhost:2498/media";
//     console.log(formData);
//     axios.post(url, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     }).then(res => {
//       console.log(res.data);
//       if (res == "no") {
//         alert("please try again");
//       }
//       setDp(res.data);

//     }).catch(err => {
//       console.log(err);
//     })

//   }
//   const uploadProduct = () => {
//     console.log("this is file", file);
//     const url = "http://localhost:2498/upload";
//     const options = {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         "seller": username,
//         "media": file,
//         "description": description.current.value,
//         "title": title.current.value,
//         "price": price.current.value,
//         "quantity": quantity.current.value,
//         "category": category.current.value,
//       })
//     }
//     fetch(url, options)
//       .then(res => res.json())
//       .then(res => {
//         if (res == "no") {
//           alert("please enter a valid data");
//         } else {
//           alert("product uploaded succesfully");
//           console.log(res);
//           setProductList([]);
          // const lst = [];
          // lst.push(res);
          // setProductList(lst);
          // console.log(lst);
          // switchToProductList();
//         }
//       })
//       .catch(err => {
//         console.log(err);
//       })

//   }
//   const buyProduct = (ThisProduct) => {
//     console.log(ThisProduct);
//     const url = "http://localhost:2498/buy";
//     const options = {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         "product": ThisProduct,
//       })
//     }
//     fetch(url, options)
//       .then(res => res.json())
//       .then(res => {
//         if (res == "no") {
//           alert("please try again with a valid data");
//         } else {
//           alert("product has Been Bought succesfully");
//           switchToHome();
//         }
//       })
//       .catch(err => {
//         console.log(err);
//       })
//   }
//   const addToCart = (ThisProduct) => {
//     console.log(ThisProduct);
//     const url = "http://localhost:2498/addToCart";
//     const options = {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         "product": ThisProduct,
//         "username": username
//       })
//     }
//     fetch(url, options)
//       .then(res => res.json())
//       .then(res => {
//         if (res == "no") {
//           alert("please try again with a valid data");
//         } else {
//           alert("product has Been moved to cart succesfully");
//         }
//       })
//       .catch(err => {
//         console.log(err);
//       })
//   }
//   const fetchCart = () => {
//     const url = "http://localhost:2498/fetchCart";
//     const options = {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         "username": username,
//       })
//     }
//     fetch(url, options)
//       .then(res => res.json())
//       .then(res => {
//         if (res == "no") {
//           alert("please try again with a valid data");
//         } else {
//           // alert("product has Been moved to cart succesfully");
//           console.log(res);
//           setCart(res);
//           switchToCart();
//         }
//       })
//       .catch(err => {
//         console.log(err);
//       })
//   }
//   const searchCategory = (e) => {
//     e.preventDefault();
//     const url = "http://localhost:2498/fetchCategory";
//     const options = {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         "category": searchData.current.value,
//       })
//     }
//     fetch(url, options)
//       .then(res => res.json())
//       .then(res => {
//         if (res == "no") {
//           alert("please try again with a valid data");
//         } else {
//           // alert("product has Been moved to cart succesfully");
//           console.log(res);
//           setProductList(res);
//           switchToProductList();
//         }
//       })
//       .catch(err => {
//         console.log(err);
//       })
//   }
//   return (
//     <div className="App">
//       {/* <img src={logo} className="App-logo" alt="logo" /> */}

//       {
//         !isLogged ?
//           <>
//             {
//               !isNewUser ?
//                 <>

//                   <div className="container">
//                     <img src={logo} className="initLogo" />
//                     <div className="loginForm">

//                       <center>
//                         <input className="inpLogin" type="text" placeholder="username" onChange={(e) => setUsername(e.target.value)} />
//                         <br />
//                         <input className="inpLogin" type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
//                         <br />
//                         <button className="submitLoginBtn" onClick={submitLogin}>Log In</button>
//                         <br />
//                       </center>
//                     </div>
//                   </div>
//                   <hr /><hr />
//                   <div className="container">
//                     <center>
//                       <button className="switchBtn" onClick={() => setIsNewUser(true)}>Not a user? Sign in </button>

//                     </center>
//                   </div>
//                 </> :
//                 <>
//                   <div className="container">
//                     <div className="loginForm1">
//                       <input classname="inpLogin1" type="file" onChange={uploadDp} />
//                       <br />
//                       <input classname="inpLogin" type="text" placeholder="username" onChange={(e) => setUsername(e.target.value)} />
//                       <br />
//                       <input classname="inpLogin" type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
//                       <br />
//                       <button className="submitLoginBtn1" onClick={submitSignin}>Sign In</button>
//                       <br />
//                     </div>
//                   </div>

//                   <hr /><hr />
//                   <center>
//                     <button className="switchBtn1" onClick={() => setIsNewUser(false)}>Not a user? Sign in </button>

//                   </center>
//                 </>
//             }
//           </> :
//           <>
//             <div className="container">
//               <div className="NavBar">
//                 <img src={logo1} className="navLogo" />
//                 <form className="SearchForm" onSubmit={searchCategory}>
//                   <input className="inpSearch" ref={searchData} placeholder="search" />
//                 </form>
//                 <img src={home} className="home" onClick={switchToHome} />
//                 <button className="sellOnAmazon" onClick={switchToSellNewProduct}>sell on amazon</button>
//                 <img src={cartLogo} className="cart" onClick={fetchCart} />
//               </div>
//             </div>
//             {
//               isHome ?
//                 <>
//                   {/* <h1>i am home</h1> */}

//                 </> :
//                 <>
//                 </>
//             }
//             {
//               isSellNewProduct ?
//                 <div className="container">
//                   <h5 className="newProdHead"><u>Sell New Product</u></h5>
//                   <br />
//                   <br />
//                   <input className="inpLogin" type="file" onChange={handleMediaChange} />
//                   <br />
//                   <input className="inpLogin" placeholder="title" ref={title} />
//                   <br />
//                   <input className="inpLogin" placeholder="description" ref={description} />
//                   <br />
//                   <input className="inpLogin" placeholder="price" ref={price} />
//                   <br />
//                   <input className="inpLogin" placeholder="quantity" ref={quantity} />
//                   <br />
//                   <input className="inpLogin" placeholder="category" ref={category} />
//                   <br />
//                   <button className="submitLoginBtn" onClick={uploadProduct} >Upload Product</button>
//                 </div> :
//                 <>
//                 </>
//             }{
//               isProductList ?
//                 <>
//                   {console.log(productList)}
//                   {
//                     productList.map(product => {
//                       return (
//                         <div className="container">
//                           <div className="product">
//                             <br/>
//                             <img src={product.media} className="productMedia" />
//                             <div className="prod_details">
//                             <span className="prod_title">{product.title}</span>
//                             <br/>
//                             <label className="lbl"><u>description:</u></label>&nbsp;&nbsp;
//                             <br/>
//                             <span className="desc">{product.description}</span>
//                             <br/>
//                             <label className="lbl"><u>seller:</u></label>&nbsp;&nbsp;
//                             <button className="ProdsellerName" onClick={() => fetchSellerData(product.seller)}>@{product.seller}</button>
//                             <br/>
//                             <label className="lbl">Price : </label>
//                             <span className="prod_price">{product.price} Rs</span>
//                             <br/>
//                             <br/>
//                             <button className="buy" onClick={() => buyProduct(product)}>Buy</button>
//                             <br/>
//                             <button className="buy" onClick={() => addToCart(product)}>Add to cart</button>
//                             <br/>
                          
//                             </div>
//                             </div>
//                         </div>
//                       )
//                     })
//                   }
//                 </> :
//                 <>
//                 </>
//             }
//             {
//               isSellerData ?
//                 <>
//                   <div className="container">
//                     {/* <h1>sellerData</h1> */}
//                     {console.log(sellerData)}
//                     {/* <h1>{sellerData.dp}</h1> */}
//                     {/* <img src={sellerData.dp} className="sellerDp" /> */}
//                     <div className="sellerPortion">
//                     <span className="sellerName">{sellerData.seller}</span>
//                     <br/>
//                     {
//                       sellerData.products.map(product => {
//                         return (
//                           <div className="container">
//                           <div className="product">
//                             <br/>
//                             <img src={product.media} className="productMedia" />
//                             <div className="prod_details">
//                             <span className="prod_title">{product.title}</span>
//                             <br/>
//                             <label className="lbl"><u>description:</u></label>&nbsp;&nbsp;
//                             <br/>
//                             <span className="desc">{product.description}</span>
//                             <br/>
//                             <label className="lbl"><u>seller:</u></label>&nbsp;&nbsp;
//                             <button className="ProdsellerName" onClick={() => fetchSellerData(product.seller)}>@{product.seller}</button>
//                             <br/>
//                             <label className="lbl">Price : </label>
//                             <span className="prod_price">{product.price} Rs</span>
//                             <br/>
//                             <br/>
//                             <button className="buy" onClick={() => buyProduct(product)}>Buy</button>
//                             <br/>
//                             <button className="buy" onClick={() => addToCart(product)}>Add to cart</button>
//                             <br/>
                          
//                             </div>
//                             </div>
//                         </div>
//                         )
//                       })
//                     }
//                     </div>
//                   </div>
//                 </> :
//                 <>
//                 </>
//             }
//             {
//               isCart ?
//                 <>
//                   <h1>cart</h1>
//                   <div className="container">
//                     {console.log(cart)}
//                     {
//                       cart.map(product => {
//                         return (
//                           <div className="container">
//                           <div className="product">
//                             <br/>
//                             <center>
//                             <img src={product.media} className="productMedia" />
//                             </center>
//                             <div className="prod_details">
//                             <span className="prod_title">{product.title}</span>
//                             <br/>
//                             <label className="lbl"><u>description:</u></label>&nbsp;&nbsp;
//                             <br/>
//                             <span className="desc">{product.description}</span>
//                             <br/>
//                             <label className="lbl"><u>seller:</u></label>&nbsp;&nbsp;
//                             <button className="ProdsellerName" onClick={() => fetchSellerData(product.seller)}>@{product.seller}</button>
//                             <br/>
//                             <label className="lbl">Price : </label>
//                             <span className="prod_price">{product.price} Rs</span>
//                             <br/>
//                             <br/>
//                             <button className="buy" onClick={() => buyProduct(product)}>Buy</button>
//                             <br/>
//                             <button className="buy" onClick={() => addToCart(product)}>Add to cart</button>
//                             <br/>
                          
//                             </div>
//                             </div>
//                         </div>
//                         )
//                       })
//                     }
//                   </div>
//                 </> :
//                 <>
//                 </>
//             }
//           </>
//       }
//     </div>
//   );
// }

// export default App;
