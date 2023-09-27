/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./App.css";
import styled from '@emotion/styled'
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";

let urlHost = window.location.origin
// const urlHost = ''
const debug = true
if (debug) {
  console.log("DEBUG ENABLE")
  urlHost = 'https://magento-circular.bgroup.com.ar'
}
else {
  console.log("DEBUG DISABLE")
}
const globalSkus = {}
const globalSkusPrice = {}

function App() {
  const [loading, setLoading] = useState(false)
  const [initState, setInitState] = useState({ slideIndex: 1, updateCount: 1 });
  const [visibleProbador, setVisibleProbador] = useState(true)
  const [addCheckout, setAddCheckout] = useState(false)
  const [cartId, setCartId] = useState()
  const [cantItems, setCantItems] = useState()
  const [positionInitial, setPositionInitial] = useState()
  const [stepMobile, setStepMobile] = useState()
  const [isMobile, setIsMobile] = useState(false)
  const [titlePlugins, setTitlePlugins] = useState('')
  const [imagenProductMobileSup, setImagenProductMobileSup] = useState()
  const [imagenProductMobileInf, setImagenProductMobileInf] = useState()
  const [positionActionMobile, setPositionActionMobile] = useState()/* 2=top 3=inf */
  const [resumeAction, setResumeAction] = useState(false)

  /* color y talla seleccion automatica inicio*/

  const [selectColorId, setSelectColorId] = useState()
  const [selectSizeId, setSelectSizeId] = useState()
  /* color y talla seleccion automatica fin*/
  const [talleSup, setTalleSup] = useState()
  const [colorSup, setColorSup] = useState()

  const [talleInf, setTalleInf] = useState()
  const [colorInf, setColorInf] = useState()


  let settings = {
    dots: false,
    className: "larico",
    infinite: true,
    centerMode: true,
    centerPadding: "0px",
    slidesToShow: 1,
    adaptiveHeight: true,
    focusOnSelect: true,
    variableWidth: true,

    /*  beforeChange: () => {
      alert('hola')
    } */
    afterChange: (state) => {
      console.log("afterChange ");
      setInitState((state) => ({ updateCount: state.updateCount + 1 }));

      /* console.log('afterChange ',state); */
    },
    init: () => {
      console.log('hola');
    },
    beforeChange: (current, next) => {
      setInitState({ slideIndex: next });
      console.log("beforeChange ", next);
      console.log("beforeChange current ", current);

    },

  };
  /* 
  {
      "cartItem": {
        "sku": "test-serena-top",
        "qty": 1,
        "quote_id": "8",
        "product_option": {
          "extension_attributes": {
            "configurable_item_options": [
              {
                "option_id": "93",
                "option_value": '212'
              },
              {
                "option_id": "144",
                "option_value": '167'
              }
            ]
          }
        },
      }
    }
  */
  /*   const ref = useRef(null); */
  const [dataCheckoutSup, setDataChekoutSup] = useState({
    cartItem: {
      sku: '',
      qty: 1,
      quote_id: '',
      product_option: {
        extension_attributes: {
          configurable_item_options: []
        }
      }
    }
  });
  const [dataCheckoutInf, setDataChekoutInf] = useState({
    cartItem: {
      sku: '',
      qty: 1,
      quote_id: '',
      product_option: {
        extension_attributes: {
          configurable_item_options: []
        }
      }
    }
  });
  const refDiv = useRef(null);
  const sliderRef = useRef();
  const sliderRefSup = useRef();
  const gotoNext = async () => {
    sliderRef.slickCurrentSlide();
  };

  const [openModal, setOpenModal] = useState(false);

  /* slider init */
  const [originalSliderDataSup, setOriginalSliderDataSup] = useState([]);
  const [currentProduct, setCurrentProduct] = useState()
  const [currentProductInf, setCurrentProductInf] = useState()
  const [originalSliderDataInf, setOriginalSliderDataInf] = useState([]);
  const [sliderDataSup, setSliderDataSup] = useState([]);
  const [sliderDataInf, setSliderDataInf] = useState([]);
  /* slider end */

  /* color sizes init */
  const [dataSizesSup, setDataSizesSup] = useState();
  const [dataColorSup, setDataColorSup] = useState();
  /* color sizes end */

  /* color sizes init */
  const [dataSizesInf, setDataSizesInf] = useState();
  const [dataColosInf, setDataColorInf] = useState();
  /* color sizes end */


  const [messageErrorTalle, setMessageErrorTalle] = useState();
  const [messageErrorColor, setMessageErrorColor] = useState();
  const [messageErrorTalleIInf, setMessageErrorTalleInf] = useState();
  const [messageErrorColorInf, setMessageErrorColorInf] = useState();
  const [formSupAddCart, setFormSupAddCart] = useState({
    size: "",
    color: "",
    sku: "",
  });
  const [formInfAddCart, setFormInfAddCart] = useState({
    size: "",
    color: "",
    sku: "",
  });
  const [dataStateAllBySkuCurrentSup, setDataStateAllBySkuCurrentSup] = useState();
  const [dataStateAllBySkuCurrentInf, setDataStateAllBySkuCurrentInf] = useState();


  const [sizeIDSup, setSizeIDSup] = useState();
  const [colorIDSup, setColorIDSup] = useState();

  const [sizeIDInf, setSizeIDInf] = useState();
  const [colorIDInf, setColorIDInf] = useState();

  const [sizesStatus, setSizesStatus] = useState();
  const [sizesStatusInf, setSizesStatusInf] = useState();

  const [colorsStatus, setColorsStatus] = useState();
  const [colorsStatusInf, setColorsStatusInf] = useState();

  const [infoDataSuperior, setInfoDataSuperior] = useState({
    name: "",
    price: 0,
    priceFinal: 0,
    slug: "",
    discount_amount: 0
  });
  const [infoDataInferior, setInfoDataInferior] = useState({
    name: "",
    price: 0,
    priceFinal: 0,
    slug: "",
    discount_amount: 0
  });
  const validateTachado = async (position, item, action) => {

    let dataIds = ''
    if (position === '2') {
      dataIds = dataStateAllBySkuCurrentSup?.extension_attributes?.configurable_product_links;
    } else if (position === '3') {
      dataIds = dataStateAllBySkuCurrentInf?.extension_attributes?.configurable_product_links;
    } else {
      return false
    }

    try {
      let response = await getCached(globalSkusPrice, dataIds,
        `${urlHost}/rest/V1/products?searchCriteria[filter_groups][0][filters][0][field]=entity_id&searchCriteria[filter_groups][0][filters][0][value]=${dataIds}&searchCriteria[filter_groups][0][filters][0][condition_type]=in`
      );

      const data = response.data.items

      if (position === '2') {

        if (action === 'talla') {
          let dArray = []
          for (let i = 0; i < data.length; i++) {
            let p = data[i]?.custom_attributes.find((item) => item.attribute_code === "size");

            if (p.value === item.option_id) {

              dArray.push(data[i])
            }
          }
          let checkStock = dArray.find((item) => item?.extension_attributes?.stock_data?.quantity === 0);
          let cAttributes = checkStock?.custom_attributes
          const vColor = cAttributes?.find((x) => x.attribute_code === "color");
          let dataListColorSup = dataColorSup
          for (let d = 0; d < dataListColorSup.length; d++) {
            if (dataListColorSup[d].option_id === vColor?.value) {
              dataListColorSup[d].stock = 0;
            } else {
              dataListColorSup[d].stock = 1;
            }
          }
          setDataColorSup(dataListColorSup)
        }
        if (action === 'color') {
          let dArrayc = []
          for (let i = 0; i < data.length; i++) {
            let p = data[i]?.custom_attributes.find((item) => item.attribute_code === "color");

            if (p?.value === item.option_id) {

              dArrayc.push(data[i])
            }
          }
          let checkStock = dArrayc.find((item) => item?.extension_attributes?.stock_data?.quantity === 0);
          let cAttributes = checkStock?.custom_attributes
          const vColor = cAttributes?.find((x) => x.attribute_code === "size");
          let dataListSizeSup = dataSizesSup
          for (let d = 0; d < dataListSizeSup.length; d++) {
            if (dataListSizeSup[d].option_id === vColor?.value) {
              dataListSizeSup[d].stock = 0;
            } else {
              dataListSizeSup[d].stock = 1;
            }
          }

          setDataSizesSup(dataListSizeSup)
        }
      }
      if (position === '3') {

        if (action === 'talla') {
          let dArray = []
          for (let i = 0; i < data.length; i++) {
            let p = data[i]?.custom_attributes.find((item) => item.attribute_code === "size");

            if (p.value === item.option_id) {

              dArray.push(data[i])
            }
          }
          let checkStock = dArray.find((item) => item?.extension_attributes?.stock_data?.quantity === 0);
          let cAttributes = checkStock?.custom_attributes
          const vColor = cAttributes?.find((x) => x.attribute_code === "color");
          let dataListColorInf = dataColosInf
          for (let d = 0; d < dataListColorInf.length; d++) {
            if (dataListColorInf[d].option_id === vColor?.value) {
              dataListColorInf[d].stock = 0;
            } else {
              dataListColorInf[d].stock = 1;
            }
          }

          setDataColorInf(dataListColorInf)
        }
        if (action === 'color') {
          let dArrayc = []
          for (let i = 0; i < data.length; i++) {
            let p = data[i]?.custom_attributes.find((item) => item.attribute_code === "color");

            if (p.value === item.option_id) {

              dArrayc.push(data[i])
            }
          }

          let checkStock = dArrayc.find((item) => item?.extension_attributes?.stock_data?.quantity === 0);
          let cAttributes = checkStock?.custom_attributes
          const vColor = cAttributes?.find((x) => x.attribute_code === "size");
          let dataListSizeInf = dataSizesInf
          for (let d = 0; d < dataListSizeInf.length; d++) {

            if (dataListSizeInf[d].option_id === vColor?.value) {
              dataListSizeInf[d].stock = 0;
            } else {
              dataListSizeInf[d].stock = 1;
            }
          }

          setDataSizesInf(dataListSizeInf)
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  const requestMultiSkusColorAndSizes = async (data, position) => {
    console.log('objectxxxxx', data);
    try {


      /* aqui trae los ids de los hijos */
      /* let idsListForGenerateName = response?.data.items[0]?.extension_attributes?.configurable_product_links.toString() */
      /* aqui trae los ids de los hijos fin*/

      let idsListSizes = data?.extension_attributes.available_swatch_options;
      let dataColorsAndSizes = data?.extension_attributes?.configurable_product_options;


      for (let i in dataColorsAndSizes) {
        let lis = dataColorsAndSizes[i].values
        for (let v in lis) {
          for (let o in idsListSizes) {

            if (idsListSizes[o].option_id == lis[v].value_index) {
              idsListSizes[o].attribute_id = dataColorsAndSizes[i].attribute_id
            }

          }
        }
      }

      let sizesList = dataColorsAndSizes?.find((x) => x.label === "Size");


      let dataSizesFinal = idsListSizes?.filter((obj1) => {

        return sizesList?.values.find((obj2) => obj1.option_id == obj2.value_index);

      }).reduce((acc, cur) => {

        if (!acc.find((obj) => obj.option_id === cur.value_index)) {

          acc.push(cur);
        }
        return acc;
      }, []);


      let idsListColor = data?.extension_attributes.available_swatch_options;
      let dataColors = data?.extension_attributes?.configurable_product_options;

      for (let i in dataColors) {
        let lis = dataColors[i].values
        for (let v in lis) {
          for (let o in idsListColor) {

            if (idsListColor[o].option_id == lis[v].value_index) {
              idsListColor[o].attribute_id = dataColors[i].attribute_id
            }

          }
        }
      }

      let colorList = dataColors?.find((x) => x.label === "Color");

      let dataColorFinal = idsListColor?.filter((obj1) => {


        return colorList?.values.find((obj2) => obj1.option_id == obj2.value_index);
      }).reduce((acc, cur) => {

        if (!acc.find((obj) => obj.option_id === cur.value_index)) {
          acc.push(cur);
        }
        return acc;
      }, []);

      if (position === "2") {
        // if (dataColorFinal.length === 1) {
        //   /* setea color por defecto si solo hay un solo color */
        //   setColorIDSup(dataColorFinal[0].option_id);
        // }
        /* 2 superior */

        setDataSizesSup(dataSizesFinal);
        setDataColorSup(dataColorFinal);
      }
      if (position === "3") {
        console.log('colo', dataColorFinal);
        /*  if(dataColorFinal?.length === 1){
           // setea color por defecto si solo hay un solo color 
           setColorIDInf(dataColorFinal[0].option_id);
         } */
        /* 3 inferior */
        setDataSizesInf(dataSizesFinal);
        setDataColorInf(dataColorFinal);
      }

    } catch (error) {
      console.log(error);
    }
  };

  const initialFunction = async (sku) => {

    try {
      let response = await getCached(globalSkus, sku, `${urlHost}/rest/V1/products/${sku}`)
      setTimeout(() => {
        setLoading(false)
      }, 5000)
      console.log("data api ", response.data);

      const imagePosition = response.data?.custom_attributes?.find(
        (x) => x.attribute_code === "garment_type"
      );
      let featureImage = response.data?.custom_attributes;
      let imageFeature = featureImage?.find((x) => x.attribute_code === 'slider_interface');
      let dataImageFeature = [{ extension_attributes: { image: imageFeature?.value }, linked_product_sku: sku }];
      /*  const urlSlug = response.data?.custom_attributes?.find(x => x.attribute_code === 'url_key') */

      let productGallery = response.data.product_links;
      Promise.all(productGallery.map(async product => {
        let res = await getCached(globalSkus, product.linked_product_sku,
          `${urlHost}/rest/V1/products/${product.linked_product_sku}`)
        if (res.data.extension_attributes.configurable_product_links) {
          let ids = res.data.extension_attributes.configurable_product_links
          await getCached(globalSkusPrice, ids, `${urlHost}/rest/V1/products?searchCriteria[filter_groups][0][filters][0][field]=entity_id&searchCriteria[filter_groups][0][filters][0][value]=${ids}&searchCriteria[filter_groups][0][filters][0][condition_type]=in`);
        }
      }
      ));
      let resultSup = productGallery?.filter(
        (item) => item.link_type === "upperlink"
      ); /* Superiores */
      let resultInf = productGallery?.filter(
        (item) => item.link_type === "customlink"
      ); /* Inferiores */

      /* lista de imagenes para la  galeria */

      setSliderDataSup(resultSup);

      setSliderDataInf(resultInf);
      /* lista de imagenes para la  galeria fin*/

      if (imagePosition.value === "2") {
        setPositionInitial('2')

        setSliderDataSup([].concat(dataImageFeature, resultSup));
        console.log(dataImageFeature, resultSup)
      } else if (imagePosition.value === "3") {
        setPositionInitial('3')

        setSliderDataInf([].concat(dataImageFeature, resultInf));
      }
    } catch (e) {
      console.log(e);
      setLoading(false)
    }
  };

  async function getCached(store, key, url) {
    let response
    if (key in store) {
      response = store[key]
      console.log(`SKU CACHED ${key}`)
    } else {
      response = await axios.get(url);
      store[key] = response
    }
    return response
  }
  /* requestBySKUConfigurable */
  const requestBySKUConfigurable = async (sku, type) => {
    try {
      let response = await getCached(globalSkus, sku, `${urlHost}/rest/V1/products/${sku}`)

      let skusDataPrice = response.data?.extension_attributes?.configurable_product_links;
      const urlSlug = response.data?.custom_attributes?.find(
        (x) => x.attribute_code === "url_key"
      );
      if (type === "2") {
        setDataStateAllBySkuCurrentSup(response.data);
        setInfoDataSuperior({
          ...infoDataSuperior,
          slug: urlSlug?.value,
          name: response?.data.name,
        });
        requestMultiSkusColorAndSizes(response.data, "2");
        obtenerPrecio(skusDataPrice.toString(), "2", null);
        setDataChekoutSup((dataCheckoutSup) => {
          const date = { ...dataCheckoutSup };
          date.cartItem.sku = sku;
          return date;
        });
      }
      if (type === "3") {
        setDataStateAllBySkuCurrentInf(response.data);
        setInfoDataInferior({
          ...infoDataInferior,
          slug: urlSlug?.value,
          name: response?.data.name,
        });
        requestMultiSkusColorAndSizes(response.data, "3");
        obtenerPrecio(skusDataPrice.toString(), "3", null);
        setDataChekoutInf((dataCheckoutInf) => {
          const date = { ...dataCheckoutInf };
          date.cartItem.sku = sku;
          return date;
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* funcion para obtener precio solamente al cambiar de slider en la galeria */
  const obtenerPrecio = async (skus2, type, idSizeId) => {

    try {
      let response = await getCached(globalSkusPrice, skus2, `${urlHost}/rest/V1/products?searchCriteria[filter_groups][0][filters][0][field]=entity_id&searchCriteria[filter_groups][0][filters][0][value]=${skus2}&searchCriteria[filter_groups][0][filters][0][condition_type]=in`);

      const data = response?.data?.items
      const pricesArray = []
      let priceFinal = 0
      let price = 0
      let discount_amount = 0

      for (let i = 0; i < data.length; i++) {
        let pdesc = data[i]?.custom_attributes.find((item) => item.attribute_code === "special_price");
        let dst = data[i]?.extension_attributes?.discount_amount
        if (type === '2' || type === '3') {
          let f = data[i]?.custom_attributes.filter((item) => item.attribute_code === "size");
          if (idSizeId) {
            if (f[0].value === idSizeId) {
              priceFinal = pdesc?.value
              price = data[i].price
            }
          }
          discount_amount = dst ? Number(dst) : discount_amount
        }
        if (pdesc) {
          pricesArray.push(pdesc?.value)
        }
      }

      if (!idSizeId) {
        let result = data?.sort((a, b) => a.price - b.price).filter((item, index, array) => item.price === array[0].price);
        price = result[0].price
        if (pricesArray.length > 0) {
          priceFinal = Math.min(...pricesArray)
        }
      }

      if (data) {
        if (type === "2") {

          /* 2 Superior */
          setInfoDataSuperior((infoDataSuperior) => ({
            ...infoDataSuperior,
            price: price,
            priceFinal: Number(priceFinal),
            discount_amount: discount_amount
          }));
        }
        if (type === "3") {

          /* 3 Inferior */
          setInfoDataInferior((infoDataInferior) => ({
            ...infoDataInferior,
            price: price,
            priceFinal: Number(priceFinal),
            discount_amount: discount_amount
          }));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const ClickModal = () => {
    setLoading(true)
    const isDesktop = window.matchMedia('(max-width: 1023px)');
    if (isDesktop.matches) {
      setIsMobile(true)
      setTitlePlugins('Combiná y encontrá tu look')
      setStepMobile('outfit')
    } else {
      setIsMobile(false)
      setTitlePlugins('Combiná y encontrá tu look')
      setStepMobile('')
    }
    let elementClass = document.querySelector('.modal-probador');
    let sku, cartId, total
    if (debug) {
      console.log("DEBUG MODE ON")
      sku = '0012'
      cartId = "";
      total = "";
    } else {
      sku = elementClass.getAttribute('data-sku')
      cartId = elementClass.getAttribute('data-quote');
      total = elementClass.getAttribute('data-items')
    }

    /* let sku = 'test-rita-pants' */

    let colorId = ''
    let attributeColor = document.querySelector('.swatch-option.color.selected');
    if (attributeColor) {
      colorId = attributeColor.getAttribute('data-option-id')
    }
    let sizeId = ''
    let attributeSize = document.querySelector('.swatch-attribute.size .swatch-option.selected');
    if (attributeSize) {
      sizeId = attributeSize.getAttribute('data-option-id')
    }


  /* let sku = 'producto-configurable' */  /* Supeior */

    /*  let sku = "49292993"; */  /* Inferior */
    //let colorId = '223'
    //let sizeId = '169'
    /* let cartId = "";
    let total = "98" */;

    if (colorId && sizeId) {
      setSelectColorId(colorId)
      setSelectSizeId(sizeId)
    }

    if (total) {
      setCantItems(Number(total))
    } else {
      setCantItems(0)
    }
    setCartId(cartId) /* carrito id generado desde magento */
    initialFunction(sku);
    setOpenModal(true);
    setStepMobile('')

  };
  const showBtnPlugins = async () => {

    document.getElementsByTagName('body')[0].style.overflow = "hidden";
    try {
      const response = await axios.get(`${urlHost}/rest/V1/outfit/token`);

      if (response?.data) {
        localStorage.setItem("token", response.data);
        axios.defaults.headers.common = { 'Authorization': `Bearer ${response.data}` }
        ClickModal()
      } else {
        return false
      }
    } catch (error) {
      console.log(error);
    }
  }
  const CloseModalDesktop = () => {
    setOpenModal(false);
    document.getElementsByTagName('body')[0].style.overflow = "auto";
    window.location.reload(true);
  }
  const ClickModalClose = () => {
    window.location.reload(true);
    /*  setOpenModal(false);
     document.getElementsByTagName('body')[0].style.overflow = "auto";
     let gallery = document.querySelector(".container_probador_plugin .galley_area");
     let info_probador = document.querySelector(".container_probador_plugin .info_probador");
     
     if (gallery && info_probador) {
       gallery.style.display = "block";
       info_probador.style.display = "none";
     } */
  }

  const sizesActionSup = async (index, itemSize, type) => {
    setSelectSizeId()
    setTalleSup(itemSize)
    validateTachado(type, itemSize, 'talla')
    setSizeIDSup(itemSize.option_id);
    setSizesStatus(index);
    let dataIds = dataStateAllBySkuCurrentSup?.extension_attributes?.configurable_product_links;
    dataIds = dataIds.toString();
    obtenerPrecio(dataIds, type, itemSize.option_id)
    setFormSupAddCart((formSupAddCart) => ({
      ...formSupAddCart,
      size: itemSize.option_id,
    }));
  };


  const sizesActionInf = async (index, itemSize, type) => {
    setSelectSizeId()
    setTalleInf(itemSize)
    validateTachado(type, itemSize, 'talla')

    setSizeIDInf(itemSize.option_id);
    setSizesStatusInf(index);
    let dataIds = dataStateAllBySkuCurrentInf?.extension_attributes?.configurable_product_links;
    dataIds = dataIds.toString();
    obtenerPrecio(dataIds, type, itemSize.option_id)

    setFormInfAddCart((formInfAddCart) => ({
      ...formInfAddCart,
      size: itemSize.option_id,
    }));

  };

  const colorAction = async (index, itemColor, type) => {
    console.log('color Click', itemColor);
    setSelectColorId()
    setColorSup(itemColor)
    validateTachado(type, itemColor, 'color')
    let dataArray = [...dataCheckoutSup.cartItem.product_option.extension_attributes.configurable_item_options]
    dataArray.push({ option_id: itemColor.attribute_id, option_value: Number(itemColor.option_id) })

    setDataChekoutSup((dataCheckoutSup) => {
      console.log(dataCheckoutSup)
      const date = { ...dataCheckoutSup };

      date.cartItem.product_option.extension_attributes.configurable_item_options = dataArray
      return date;
    });
    setColorIDSup(itemColor.option_id);
    setColorsStatus(index);
    let dataIds = dataStateAllBySkuCurrentSup?.extension_attributes?.configurable_product_links;
    dataIds = dataIds.toString();

    try {

      let response = await getCached(globalSkusPrice, dataIds,
        `${urlHost}/rest/V1/products?searchCriteria[filter_groups][0][filters][0][field]=entity_id&searchCriteria[filter_groups][0][filters][0][value]=${dataIds}&searchCriteria[filter_groups][0][filters][0][condition_type]=in`
      );

      console.log('capturar iamgen ', response.data?.items)
      let colorDataImgs = response.data?.items;
      let dataCustomAttributes = [];
      let dataCustomAttributesFinal = [];
      for (let i = 0; i < colorDataImgs.length; i++) {
        let dataAttributes = colorDataImgs[i]?.custom_attributes;

        for (let c = 0; c < dataAttributes.length; c++) {
          if (dataAttributes[c].attribute_code === "slider_interface") {
            dataCustomAttributes.push(colorDataImgs[i]);
          }
        }
      }

      for (let u = 0; u < dataCustomAttributes.length; u++) {
        let dataAttributesU = colorDataImgs[u].custom_attributes;

        for (let o = 0; o < dataAttributesU.length; o++) {
          if (dataAttributesU[o].attribute_code === "color" && dataAttributesU[o].value === itemColor.option_id) {
            dataCustomAttributesFinal.push(dataCustomAttributes[u]);
          }
        }
      }

      let dImagen = dataCustomAttributesFinal[0]?.custom_attributes;

      if (type === "2") {
        let imgS = dImagen?.find((item) => item.attribute_code === "slider_interface");
        setImagenProductMobileSup(imgS.value)
        let dataImageFeatureColor = [
          { extension_attributes: { image: imgS.value }, linked_product_sku: 0 },
        ];


        let slider = sliderDataSup

        slider.map(function (dato) {
          if (dato.position == currentProduct.position) {
            console.log("este: ", dato.position)
            dato.extension_attributes.image = dataImageFeatureColor[0].extension_attributes.image
          }
          return dato;
        });

        console.log(slider)

        console.log('slider-original: ', sliderDataSup, dataImageFeatureColor)
        setOriginalSliderDataSup(slider)
        console.log('slider-nuevo: ', sliderDataSup, slider.indexOf("Camisa Rip Curl Stripess"))
      }
      setFormSupAddCart((formSupAddCart) => ({
        ...formSupAddCart,
        color: itemColor.option_id,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  /* request price final de talla y color */
  /*   const requestPriceFinal = async (skus, sizeId, colorId, type) => {
      let dataIds = skus?.extension_attributes?.configurable_product_links;
      dataIds = dataIds.toString();
      try {
        const response = await axios.get(
          `${urlHost}/rest/V1/products?searchCriteria[filter_groups][0][filters][0][field]=entity_id&searchCriteria[filter_groups][0][filters][0][value]=${dataIds}&searchCriteria[filter_groups][0][filters][0][condition_type]=in`
        );
       
          console.log('combinacion prices xxxx', response.data);
        let data = response?.data?.items;
        let dataPrice = [];
        for (let i = 0; i < data.length; i++) {
          let dataAttributes = data[i].custom_attributes;
          let color = null;
          let size = null;
          // eslint-disable-next-line no-loop-func
          let newObj = Object.keys(dataAttributes).map((key) => {
            if (dataAttributes[key].attribute_code === "size") {
              if (dataAttributes[key].value === sizeId) {
                size = dataAttributes[key].value;
              }
            }
            if (dataAttributes[key].attribute_code === "color") {
              if (dataAttributes[key].value === colorId) {
                color = dataAttributes[key].value;
              }
            }
  
            return {
              size: size,
              color: color,
            };
          });
  
          let itemzc = newObj.find(
            (item) => item.size === sizeId && item.color === colorId
          );
          dataPrice.push({data: data[i], itemzc});
        }
  
        let fn = dataPrice.find(
          (item) => item.itemzc?.size === sizeId && item.itemzc?.color === colorId
        );
        if (type === "2") {
          setInfoDataSuperior({...infoDataSuperior, price: fn?.data?.price});
        }
        if (type === "3") {
          setInfoDataInferior({...infoDataInferior, price: fn?.data?.price});
        }
      } catch (err) {
        console.log(err);
      }
    }; */

  /* request color inferior */
  const colorActionInf = async (index, itemColor, type) => {
    setSelectColorId()
    setColorInf(itemColor)
    validateTachado(type, itemColor, 'color')

    setColorIDInf(itemColor.option_id);
    setColorsStatusInf(index);
    let dataIds = dataStateAllBySkuCurrentInf?.extension_attributes?.configurable_product_links;
    dataIds = dataIds.toString();

    try {
      let response = await getCached(globalSkusPrice, dataIds,
        `${urlHost}/rest/V1/products?searchCriteria[filter_groups][0][filters][0][field]=entity_id&searchCriteria[filter_groups][0][filters][0][value]=${dataIds}&searchCriteria[filter_groups][0][filters][0][condition_type]=in`
      );

      /* console.log('color api Inf', response.data?.items); */
      let colorDataImgs = response.data?.items;
      let dataCustomAttributes = [];
      let dataCustomAttributesFinal = [];
      for (let i = 0; i < colorDataImgs.length; i++) {
        let dataAttributes = colorDataImgs[i].custom_attributes;

        for (let c = 0; c < dataAttributes.length; c++) {
          if (dataAttributes[c].attribute_code === "slider_interface") {
            dataCustomAttributes.push(colorDataImgs[i]);
          }
        }
      }

      for (let u = 0; u < dataCustomAttributes.length; u++) {
        let dataAttributesU = colorDataImgs[u].custom_attributes;

        for (let o = 0; o < dataAttributesU.length; o++) {
          if (
            dataAttributesU[o].attribute_code === "color" &&
            dataAttributesU[o].value === itemColor.option_id
          ) {
            dataCustomAttributesFinal.push(dataCustomAttributes[u]);
          }
        }
      }

      if (dataCustomAttributesFinal[0]) {
        let dImagen = dataCustomAttributesFinal[0].custom_attributes;
        if (type === "3") {

          /* Prenda inferior */
          let imgI = dImagen.find((item) => item.attribute_code === "slider_interface");
          setImagenProductMobileInf(imgI.value)
          let dataImageFeatureColor = [
            { extension_attributes: { image: imgI.value }, linked_product_sku: 0 },
          ];


          let sliderInf = sliderDataInf

          sliderInf.map(function (dato) {
            if (dato.position == currentProductInf.position) {
              console.log("este: ", dato.position)
              dato.extension_attributes.image = dataImageFeatureColor[0].extension_attributes.image
            }
            return dato;
          });

          console.log(sliderInf)

          console.log('slider-original-inf: ', sliderDataInf, dataImageFeatureColor)
          setOriginalSliderDataInf(sliderInf)
          console.log('slider-nuevo-inf: ', sliderDataInf)
        }

      }
      setFormInfAddCart((formInfAddCart) => ({
        ...formInfAddCart,
        color: itemColor.option_id,
      }));
    } catch (error) {
      console.log(error);
    }
  };
  const beforeChangeEvent = (currentSlide) => {
    setCurrentProduct(sliderDataSup[currentSlide])
    console.log('change event slider superior', sliderDataSup[currentSlide]);
    let skuIndexCurrent = sliderDataSup[currentSlide];
    let skuPrimary = skuIndexCurrent?.linked_product_sku;
    if (skuPrimary) {
      /* console.log('event next sup', currentSlide,skuPrimary); */
      requestBySKUConfigurable(skuPrimary, "2");
      /*  requestMultiSkusColorAndSizes(skuPrimary,'2',null) */
      setSizeIDSup(); /* reset size sup al cambiar de prod nuevo */
      setColorIDSup(); /* reset color sup al cambiar de prod nuevo */
      setColorsStatus(); /* reset */
      setSizesStatus(); /* reset */

      setMessageErrorTalle()
      setMessageErrorColor()
      setSizes({})
      let bg = document.querySelector('.containerGallery .slick-slider .slick-list') || '';
      if (bg) {
        bg.style.backgroundColor = '#fff';
      }
      const removeStyle = document.querySelector('.containerGallery .slick-current .listItem') || '';
      if (removeStyle) {
        removeStyle.style.height = '';
      }
      const promo = document.querySelector('.containerGallery .slick-track .slick-current .promocion');
      if (promo) {
        promo.textContent = '';
        promo.style.display = 'none'
        promo.style.fontSize = '0px'
      }
    }
  };

  const beforeChangeEventInf = (currentSlide) => {
    setCurrentProductInf(sliderDataInf[currentSlide])
    let skuIndexCurrent = sliderDataInf[currentSlide];
    let skuPrimary = skuIndexCurrent?.linked_product_sku;
    if (skuPrimary) {
      /* console.log('event next inf', currentSlide,skuPrimary); */
      requestBySKUConfigurable(skuPrimary, "3");
      /*  requestMultiSkusColorAndSizes(skuPrimary,'3',null) */
      setSizeIDInf(); /* reset size inf al cambiar de prod nuevo */
      setColorIDInf(); /* reset color inf al cambiar de prod nuevo */
      setSizesStatusInf(); /* reset */
      setColorsStatusInf(); /* reset */

      setMessageErrorTalleInf()
      setMessageErrorColorInf()
      setSizes({})
      let bg = document.querySelector('.containerGallery .slick-slider .slick-list') || '';
      if (bg) {
        bg.style.backgroundColor = '#fff';
      }
      const removeStyle = document.querySelector('.containerGallery .slick-current .listItem') || '';
      if (removeStyle) {
        removeStyle.style.height = '';
      }
      const promo = document.querySelector('.containerGallery2 .slick-track .slick-current .promocion');
      if (promo) {
        promo.textContent = '';
        promo.style.display = 'none'
      }
    }
  };

  const addToCart = async (type) => {
    if (type === "2") {

      if (!colorIDSup && dataColorSup) {
        setMessageErrorColor("* Tenes que seleccionar un color");
        return;
      } else {
        setMessageErrorColor();
      }
      if (!sizeIDSup && dataSizesSup) {
        setMessageErrorTalle("* Tenes que seleccionar un talle");
        return;
      } else {
        setMessageErrorTalle();
      }
      setSizeIDSup(); /* reset size sup al cambiar de prod nuevo */
      setColorIDSup(); /* reset color sup al cambiar de prod nuevo */
      setColorsStatus(); /* reset */
      setSizesStatus(); /* reset */
    }
    if (type === "3") {

      if (!colorIDInf && dataColosInf) {
        setMessageErrorColorInf("* Tenes que seleccionar un color");
        return;
      } else {
        setMessageErrorColorInf();
      }
      if (!sizeIDInf && dataSizesInf) {
        setMessageErrorTalleInf("* Tenes que seleccionar un talle");
        return;
      } else {
        setMessageErrorTalleInf();
      }
      setSizeIDInf(); /* reset size inf al cambiar de prod nuevo */
      setColorIDInf(); /* reset color inf al cambiar de prod nuevo */
      setSizesStatusInf(); /* reset */
      setColorsStatusInf(); /* reset */
    }


    try {
      if (type === '2') {
        let dataArray = [{ option_id: talleSup.attribute_id, option_value: Number(talleSup.option_id) }]
        if (colorIDSup) {
          if (colorSup) {
            let dataArrayColorSup = [{ option_id: colorSup.attribute_id, option_value: Number(colorSup.option_id) }]
            dataArray = dataArray.concat(dataArrayColorSup)
          }
        }
        const dateSup = { ...dataCheckoutSup };
        dateSup.cartItem.product_option.extension_attributes.configurable_item_options = dataArray;

        if (!cartId) {
          await axios.post(`${urlHost}/rest/V1/carts`).then(async (response) => {
            console.log('data nuevo cart', response);
            setCartId(response.data)
            if (response.status === 200) {
              const idCartNew = response.data;
              const items = { ...dateSup }
              items.cartItem.quote_id = idCartNew
              const res = await axios.post(`${urlHost}/rest/V1/carts/${idCartNew}/items`, items);
              console.log("add product al checkout Sup", res);
              cantCartRequestApi(idCartNew)
            }
          })

        } else {
          const itemsSup = { ...dateSup }
          itemsSup.cartItem.quote_id = cartId
          const response = await axios.post(`${urlHost}/rest/V1/carts/${cartId}/items`, itemsSup);
          console.log("add product al checkout Sup", response);
          cantCartRequestApi(cartId)
        }
        setSizeIDSup(); /* reset size sup al cambiar de prod nuevo */
        setColorIDSup(); /* reset color sup al cambiar de prod nuevo */
        setColorsStatus(); /* reset */
        setSizesStatus(); /* reset */
        if (isMobile) {
          setPositionActionMobile()/* reset mobile */
          showHiddenElements() /* oculta elemento */
          setStepMobile('successAdd')
        }
      }
      if (type === '3') {
        console.log('test color id colorIDInf ', colorIDInf);
        console.log('test color colorInf ', colorInf);
        let dataArrayInf = [{ option_id: talleInf.attribute_id, option_value: Number(talleInf.option_id) }]
        if (colorIDInf) {
          if (colorInf) {
            let dataArrayColorInf = [{ option_id: colorInf.attribute_id, option_value: Number(colorInf.option_id) }]
            dataArrayInf = dataArrayInf.concat(dataArrayColorInf)
          }
        }
        const dateInf = { ...dataCheckoutInf };
        dateInf.cartItem.product_option.extension_attributes.configurable_item_options = dataArrayInf;

        if (!cartId) {
          await axios.post(`${urlHost}/rest/V1/carts`).then(async (response) => {
            console.log('data nuevo cart', response.data);
            setCartId(response.data)
            if (response.status === 200) {
              const idCartNew = response.data;
              const items = { ...dateInf }
              items.cartItem.quote_id = idCartNew
              console.log('data checkout ok ', items);
              const res = await axios.post(`${urlHost}/rest/V1/carts/${idCartNew}/items`, items);
              console.log("add product al checkout Inf1", res);
              cantCartRequestApi(idCartNew)
            }
          })

        } else {
          const itemsInf = { ...dateInf }
          itemsInf.cartItem.quote_id = cartId
          const response = await axios.post(`${urlHost}/rest/V1/carts/${cartId}/items`, itemsInf);
          console.log("add product al checkout Inf", response);
          cantCartRequestApi(cartId)
        }
        setSizeIDInf(); /* reset size inf al cambiar de prod nuevo */
        setColorIDInf(); /* reset color inf al cambiar de prod nuevo */
        setSizesStatusInf(); /* reset */
        setColorsStatusInf(); /* reset */
        if (isMobile) {
          setPositionActionMobile()/* reset mobile */
          showHiddenElements() /* oculta elemento */
          setStepMobile('successAdd')
        }
      }

    } catch (error) {
      console.log(error);
    }

  };
  /* agregar look completo */
  const addCartAll = async () => {
    console.log('click btn all add');

    if (!colorIDSup) {
      setMessageErrorColor("* Tenes que seleccionar un color");
      return;
    } else {
      setMessageErrorColor();
    }
    if (!sizeIDSup) {
      setMessageErrorTalle("* Tenes que seleccionar un talle");
      return;
    } else {
      setMessageErrorTalle();
    }
    if (!sizeIDInf) {
      setMessageErrorTalleInf("* Tenes que seleccionar un talle");
      return;
    } else {
      setMessageErrorTalleInf();
    }
    if (!colorIDInf) {
      setMessageErrorColorInf("* Tenes que seleccionar un color");
      return;
    } else {
      setMessageErrorColorInf();
    }

    try {
      let dataArray = [{ option_id: talleSup.attribute_id, option_value: Number(talleSup.option_id) }]
      if (colorIDSup) {
        if (colorSup) {
          let dataArrayColorSup = [{ option_id: colorSup.attribute_id, option_value: Number(colorSup.option_id) }]
          dataArray = dataArray.concat(dataArrayColorSup)
        }
      }
      const dateSup = { ...dataCheckoutSup };
      dateSup.cartItem.product_option.extension_attributes.configurable_item_options = dataArray;
      /* inf */

      let dataArrayInf = [{ option_id: talleInf.attribute_id, option_value: Number(talleInf.option_id) }]
      if (colorIDInf) {
        if (colorInf) {
          let dataArrayColorInf = [{ option_id: colorInf.attribute_id, option_value: Number(colorInf.option_id) }]
          dataArrayInf = dataArrayInf.concat(dataArrayColorInf)
        }
      }
      const dateInf = { ...dataCheckoutInf };
      dateInf.cartItem.product_option.extension_attributes.configurable_item_options = dataArrayInf;

      if (!cartId) {
        await axios.post(`${urlHost}/rest/V1/carts`).then(async (response) => {
          console.log('se creo carrito desde pluging=>', response.data);
          setCartId(response.data)
          if (response.status === 200) {
            const idCartNew = response.data;
            const items2 = { ...dateSup }
            items2.cartItem.quote_id = idCartNew
            const items3 = { ...dateInf }
            items3.cartItem.quote_id = idCartNew
            const res2 = await axios.post(`${urlHost}/rest/V1/carts/${idCartNew}/items`, items2);
            const res3 = await axios.post(`${urlHost}/rest/V1/carts/${idCartNew}/items`, items3);
            console.log("add product al checkout look", res2, res3);
            cantCartRequestApi(idCartNew)
            if (!isMobile) {
              setAddCheckout(true)
            }
          }
        })
      } else {
        const itemsSup = { ...dateSup }
        itemsSup.cartItem.quote_id = cartId
        const itemsInf = { ...dateInf }
        itemsInf.cartItem.quote_id = cartId
        console.log('existio carrito desde magento=>', cartId);
        const response2 = await axios.post(`${urlHost}/rest/V1/carts/${cartId}/items`, itemsSup);
        const response3 = await axios.post(`${urlHost}/rest/V1/carts/${cartId}/items`, itemsInf);
        console.log("add product al checkout look", response2, response3);
        cantCartRequestApi(cartId)
        if (!isMobile) {
          setAddCheckout(true)
        }
      }
      setSizeIDSup(); /* reset size sup al cambiar de prod nuevo */
      setColorIDSup(); /* reset color sup al cambiar de prod nuevo */
      setColorsStatus(); /* reset */
      setSizesStatus(); /* reset */

      setSizeIDInf(); /* reset size inf al cambiar de prod nuevo */
      setColorIDInf(); /* reset color inf al cambiar de prod nuevo */
      setSizesStatusInf(); /* reset */
      setColorsStatusInf(); /* reset */
      if (!isMobile) {
        setAddCheckout(true)/* producto en checkout */
      }
      if (isMobile) {
        setPositionActionMobile()/* reset mobile */
        showHiddenElements() /* oculta elemento */
        setStepMobile('successAdd')
      }
    } catch (error) {
      console.log(error);
    }
    /* setCantItems(2); */
  };

  const cantCartRequestApi = async (cId) => {
    try {
      const response = await axios.get(`${urlHost}/rest/V1/carts/${cId}`);
      setCantItems(Number(response.data.items_qty))
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    sliderRefSup.current.slickGoTo(0);
  }, [sliderDataSup]);
  useEffect(() => {
    sliderRef.current.slickGoTo(0);
  }, [sliderDataInf]);


  /* useEffect(() => {
       if (sizeIDSup && colorIDSup) {
        requestPriceFinal(dataStateAllBySkuCurrentSup, sizeIDSup, colorIDSup, "2");
      } 
    }, [sizeIDSup, colorIDSup]);
  
    useEffect(() => {
      if (sizeIDInf && colorIDInf) {
        requestPriceFinal(dataStateAllBySkuCurrentInf, sizeIDInf, colorIDInf, "3");
      }
    }, [sizeIDInf, colorIDInf]); */

  useEffect(() => {

    const exist = window.document.querySelector('.modal-probador') || '';
    if (exist) {
      let att = exist.getAttribute('data-sku');
      if (att) {
        setVisibleProbador(true)
      } else {
        setVisibleProbador(false)
      }
    }
  }, [])

  const [isDragStarted, setDragStarted] = useState(false);
  const [sizes, setSizes] = useState({});
  const dragElement = useRef(null);
  const container = useRef(null);

  const containerOnMouseMove = (e) => {
    /* const isDesktop = window.matchMedia('(max-width: 1023px)'); 
    
      if (!isDesktop.matches) {*/
    if (!isDragStarted || !e.pageY) {
      return
    };
    /*  } */

    let leftValue = e.pageY - sizes.dragHeight / 2;

    if (leftValue < sizes.minLeft) {
      leftValue = sizes.minLeft;
    } else if (leftValue > sizes.maxLeft) {
      leftValue = sizes.maxLeft;
    }

    let widthValue = (leftValue + sizes.dragHeight / 2 - sizes.containerOffset) * 100 / sizes.containerHeight + '%';

    setSizes({
      ...sizes,
      resizableImageWidth: widthValue
    })
  }
  const onDragStart = (e) => {
    let bg = document.querySelector('.containerGallery .slick-slider .slick-list');
    if (bg) {
      bg.style.backgroundColor = 'transparent'
    }
    /* e.preventDefault(); */
    let maxLeft = 0
    const dragHeight = dragElement?.current?.offsetHeight,
      xPosition = e.pageY,

      containerOffset = container?.current?.offsetTop,
      containerHeight = container?.current?.offsetHeight,
      minLeft = containerOffset + 10;

    if (isMobile) {
      maxLeft = containerOffset + containerHeight - dragHeight - 140;
    } else {
      maxLeft = containerOffset + containerHeight - dragHeight - 220;
    }

    setSizes({
      ...sizes,
      dragHeight,
      xPosition,
      containerOffset,
      containerHeight,
      minLeft,
      maxLeft
    });
    if (isMobile) {

      let leftValue = e.pageY - dragHeight / 2;
      if (leftValue < minLeft) {
        leftValue = minLeft;
      } else if (leftValue > maxLeft) {
        leftValue = maxLeft;
      }
      let widthValue = (leftValue + dragHeight / 2 - containerOffset) * 100 / containerHeight + '%';
      setSizes({
        ...sizes,
        resizableImageWidth: widthValue
      })
    }
    setDragStarted(true);

  }
  const onDragStop = () => {
    const isDesktop = window.matchMedia('(max-width: 1023px)');
    if (!isDesktop.matches) {
      setDragStarted(false);
    }

  }

  useEffect(() => {
    document.querySelector('.btn_subir_bajer_probador').addEventListener('touchmove', function (event) {
      onDragStart(event.changedTouches[0])
    })
  }, [sizes])

  useEffect(() => {

    let divInf2 = document.querySelector('.containerGallery .slick-current .listItem') || '';
    if (divInf2) {
      divInf2.style.height = `${sizes.resizableImageWidth}`;
    }

  }, [sizes])

  useEffect(() => {
    /* console.log('idddd ', dataColorSup)
    for(let i in dataColorSup){
      if(dataColorSup[i].option_id === '224'){
       console.log('existe',dataColorSup[i]);
      }
    } */
    if (positionInitial === '2') {
      for (let i in dataSizesSup) {
        if (dataSizesSup[i].option_id === selectSizeId) {
          sizesActionSup(Number(i), dataSizesSup[i], '2')
        }
      }
    } else if (positionInitial === '3') {
      for (let i in dataSizesInf) {
        if (dataSizesInf[i].option_id === selectSizeId) {
          sizesActionInf(Number(i), dataSizesInf[i], '3')
        }
      }
    }
  }, [dataSizesInf, dataSizesSup, positionInitial])
  useEffect(() => {
    /* funcionalidad para autoseleccionar color y talla segun como venga desde magento */
    if (positionInitial === '2') {
      for (let i in dataColorSup) {
        if (dataColorSup[i].option_id === selectColorId) {
          colorAction(Number(i), dataColorSup[i], '2')
        }
      }
    } else if (positionInitial === '3') {
      for (let i in dataColosInf) {
        if (dataColosInf[i].option_id === selectColorId) {
          colorActionInf(Number(i), dataColosInf[i], '3')
        }
      }
    }
  }, [dataColorSup, dataColosInf, positionInitial]);

  useEffect(() => {
    const promo = document.querySelector('.containerGallery .slick-slide.slick-active.slick-center.slick-current .promocion') || '';
    if (promo) {
      promo.textContent = '';
      promo.style.width = '0px'
      promo.style.padding = '0'
      promo.style.display = 'none'
      promo.style.fontSize = '0px'
      if (infoDataSuperior.discount_amount) {
        promo.style.width = 'auto'
        promo.style.padding = '3px 10px'
        promo.style.fontSize = '12px'
        promo.style.display = 'block'
        promo.textContent += infoDataSuperior.discount_amount + '% OFF';
      } else {
        promo.style.width = '0px'
        promo.textContent = '';
        promo.style.fontSize = '0px'
        promo.style.display = 'none'
      }
    }
  }, [infoDataSuperior]);

  useEffect(() => {
    const promo = document.querySelector('.containerGallery2 .slick-slide.slick-active.slick-center.slick-current .promocion') || '';
    if (promo) {
      promo.textContent = '';
      promo.style.width = '0px'
      promo.style.padding = '0'
      promo.style.display = 'none'
      promo.style.fontSize = '0px'
      if (infoDataInferior.discount_amount) {
        promo.style.width = 'auto'
        promo.style.padding = '3px 10px'
        promo.style.fontSize = '12px'
        promo.style.display = 'block'
        promo.textContent = infoDataInferior.discount_amount + '% OFF';
      } else {
        promo.style.width = '0px'
        promo.textContent = '';
        promo.style.fontSize = '0px'
        promo.style.display = 'none'
      }
    }
  }, [infoDataInferior]);

  const talleColorOptions = () => {
    setIsMobile(true) /* activa si estan en mobile */
    let gallery = document.querySelector(".container_probador_plugin .galley_area");
    let talleColor = document.querySelector(".container_probador_plugin .info_probador");
    setStepMobile('seleccionTalleColor')
    if (gallery.style.display === "block") {
      gallery.style.display = "none";
      talleColor.style.display = "block";
    }
    let captureImageSup = document.querySelector(".containerGallery .slick-active.slick-current #imageFeatureGallerySup");
    let captureImageInf = document.querySelector(".containerGallery2 .slick-active.slick-current #imageFeatureGalleryInf");
    let imgsrcSup = captureImageSup.getAttribute('src');
    let imgsrcInf = captureImageInf.getAttribute('src');

    let pluginsImageSup = document.querySelector(".container_probador_plugin .imageMobile #featureImgSup");
    let pluginsImageInf = document.querySelector(".container_probador_plugin .imageMobile #featureImgInf");

    pluginsImageInf.setAttribute('src', imgsrcInf);
    pluginsImageSup.setAttribute('src', imgsrcSup);

  }
  const showHiddenElements = () => {
    let talleColor = document.querySelector(".container_probador_plugin .info_probador");
    if (talleColor.style.display === "block") {
      talleColor.style.display = "none";
    }
  }
  /* accion boton AÑADIR A LA BOLSA  en mobile*/
  const productAddSuccess = () => {

    if (positionActionMobile === '2') {
      addToCart('3') /* si se elimino el bloque superior ejecutar el bloque Inferior para anadir al carro*/
    } else if (positionActionMobile === '3') {
      addToCart('2') /* si se elimino el bloque Inferior ejecutar el bloque Superior para anadir al carro */
    } else {
      addCartAll()
    }

  }
  const redirectCheckout = () => {
    window.location.href = '/checkout/cart/';
  }
  const volverCombinar = () => {
    setStepMobile('')
    let gallery = document.querySelector(".container_probador_plugin .galley_area");
    let talleColor = document.querySelector(".container_probador_plugin .info_probador");
    if (gallery && talleColor) {
      gallery.style.display = "block";
      talleColor.style.display = "none";
    }
    let secSup = document.querySelector(".container_probador_plugin #sectionBlockSup");
    secSup.style.display = "flex";
    let secInf = document.querySelector(".container_probador_plugin #sectionBlockInf");
    secInf.style.display = "flex";
  }
  const seguirComprando = () => {
    // window.location.reload(true);
    setAddCheckout(false)
    // addCheckout = false
  }
  const deleteItemBlock = (type) => {
    if (type === '2') {
      let secSup = document.querySelector(".container_probador_plugin #sectionBlockSup");
      secSup.style.display = "none";
      setPositionActionMobile('2')
    }
    if (type === '3') {
      let secInf = document.querySelector(".container_probador_plugin #sectionBlockInf");
      secInf.style.display = "none";
      setPositionActionMobile('3')
    }
  }
  /* Mostrar ocultar resumen total en Mobile */
  const showResumeAction = () => {
    setResumeAction(!resumeAction)
  }
  useEffect(() => {
    if (!isMobile) {
      let captureImageSup = document.querySelector(".containerGallery .slick-active.slick-current #imageFeatureGallerySup");
      let captureImageInf = document.querySelector(".containerGallery2 .slick-active.slick-current #imageFeatureGalleryInf");
      if (captureImageSup && captureImageInf) {
        let imgsrcSup = captureImageSup.getAttribute('src');
        let imgsrcInf = captureImageInf.getAttribute('src');

        if (imgsrcSup && imgsrcInf) {
          let pluginsImageSup = document.querySelector(".checkoutAddMessage .prodItems #imgSupDesk");
          let pluginsImageInf = document.querySelector(".checkoutAddMessage .prodItems #imgInfDesk");
          if (pluginsImageSup && pluginsImageInf) {
            pluginsImageInf.setAttribute('src', imgsrcInf);
            pluginsImageSup.setAttribute('src', imgsrcSup);
          }
        }
      }
    }
  }, [addCheckout])
  useEffect(() => {

  }, [])
  return (
    <div className="App">
      {/* <button className="open-modal" id="modal1" onClick={gotoNext}>test</button> */}
      {visibleProbador &&
        <BotonIncial className="open-modal-probador" id="modal1" onClick={showBtnPlugins}>
          Combinar
        </BotonIncial>
      }
      <div data-id="modal1" className={`modal-wrap ${openModal ? "modal-opened" : ""}`}>
        <div className="modal-overlay"></div>
        <div className="modal-content">
          {!isMobile ?
            <button className="modal-close" onClick={() => { CloseModalDesktop() }}>
              &#10005;
            </button>
            : <button className="modal-close" onClick={ClickModalClose}>
              &#10005;
            </button>
          }
          <div className="header-title-modal">{titlePlugins}</div>
          <BotonCarrito href="/checkout/cart/" className="btn_cart_items_probador">
            {cantItems ? <span>{cantItems}</span> : ""} Ir al carrito
          </BotonCarrito>
          {loading && (

            <div className="loadingContent">
              <div className="loadWrap">
                <span className="loader"></span>
                <h3>Buscando Outfits</h3>
                <p>Estamos configurando prendas para que armes las mejores combinaciones.</p>
              </div>
            </div>

          )}

          {addCheckout && (
            <div className="checkoutAddMessage">
              <div className="checkAddWrap">
                <div className="viewInfoAddCard">
                  <img src={`${urlHost}/media/imageeditor/iconos/icon_messageAdd.svg`} alt="" />
                  <h2>¡Excelente elección!</h2>
                  <p>Tu look te esta esperando en el carrito.</p>
                  <div className="prodItems">
                    <div className="item sup">
                      <div className="imgContent"><img id="imgSupDesk" src={`${urlHost}/media/catalog/product${imagenProductMobileSup}`} alt="" /></div>
                      <div className="info">
                        <h3>{infoDataSuperior?.name}</h3>
                        <p>AR$ {infoDataSuperior?.priceFinal ? infoDataSuperior?.priceFinal : infoDataSuperior?.price}</p>
                      </div>
                    </div>
                    <div className="item inf">
                      <div className="imgContent"><img id="imgInfDesk" src={`${urlHost}/media/catalog/product${imagenProductMobileInf}`} alt="" /></div>
                      <div className="info">
                        <h3>{infoDataInferior?.name}</h3>
                        <p>AR$ {infoDataInferior?.priceFinal ? infoDataInferior?.priceFinal : infoDataInferior?.price}</p>
                      </div>
                    </div>
                  </div>
                  <div className="section_add_cart_desk">
                    <button className="btnAddCart" onClick={redirectCheckout}>Ir al carrito</button>
                    <button className="btnVolver" onClick={seguirComprando}>Seguir comprando</button>
                  </div>

                </div>
              </div>
            </div>
          )}

          <div className="container_probador_plugin">
            <div className={`galley_area`} ref={container} onMouseMove={containerOnMouseMove} /* onMouseOut={onMouseOutFuera} */ onClick={onDragStop} style={{ display: 'block' }}>
              <BotonSubirBajar className={`btn_subir_bajer_probador ${isDragStarted && 'draggable'}`} onMouseDown={onDragStart} onMouseUp={onDragStop} style={{ top: sizes?.resizableImageWidth }} ref={dragElement}>Subir Bajar</BotonSubirBajar>
              <div className="containerGallery" >

                <Slider
                  {...settings}
                  ref={sliderRefSup}
                  beforeChange={beforeChangeEvent}
                  afterChange={beforeChangeEvent}
                >

                  {(sliderDataSup.length >= originalSliderDataSup.length) &&
                    sliderDataSup?.map((item, index) => {
                      return (
                        <div key={index} className={`listItem`} >
                          <span className="promocion"></span>
                          <img id="imageFeatureGallerySup"
                            src={`${urlHost}/media/catalog/product${item?.extension_attributes?.image}`}
                            alt="imagen"
                          />
                        </div>
                      )
                    })}
                  {(sliderDataSup.length < originalSliderDataSup.length) &&
                    originalSliderDataSup?.map((item, index) => {
                      console.log('slider-new: ', JSON.stringify(sliderDataSup))
                      return (
                        <div key={index} className={`listItem`} >
                          <span className="promocion"></span>
                          <img id="imageFeatureGallerySup"
                            src={`${urlHost}/media/catalog/product${item?.extension_attributes?.image}`}
                            alt="imagen"
                          />
                        </div>
                      )
                    })}
                </Slider>
              </div>

              <div className="containerGallery2">
                <Slider
                  {...settings}
                  ref={sliderRef}
                  beforeChange={beforeChangeEventInf}
                  afterChange={beforeChangeEventInf}

                >
                  {(sliderDataInf.length >= originalSliderDataInf.length) &&
                    sliderDataInf.map((item, index) => (
                      <div key={index} className={`listItem`}>
                        <span className="promocion"></span>
                        <img id="imageFeatureGalleryInf"
                          src={`${urlHost}/media/catalog/product${item?.extension_attributes?.image}`}
                          alt="imagen"
                        />
                      </div>
                    ))}
                  {(sliderDataInf.length < originalSliderDataInf.length) &&
                    originalSliderDataInf.map((item, index) => (
                      <div key={index} className={`listItem`}>
                        <span className="promocion"></span>
                        <img id="imageFeatureGalleryInf"
                          src={`${urlHost}/media/catalog/product${item?.extension_attributes?.image}`}
                          alt="imagen"
                        />
                      </div>
                    ))}
                </Slider>
              </div>

            </div>
            <div className="info_probador">
              {stepMobile === 'seleccionTalleColor' &&
                <div className="messageAddCart"><h2>¡Excelente elección!</h2> <span>Selecciona tu talle</span></div>
              }
              <div className="block superior" id="sectionBlockSup">
                <div className="imageMobile"><img id='featureImgSup' src={`${urlHost}/media/catalog/product${imagenProductMobileSup}`} alt="" /></div>
                <div className="info_detail">
                  <div className="head_info">
                    <div className="title_info">
                      <h2>{infoDataSuperior?.name}</h2>
                      <a
                        href={`/${infoDataSuperior.slug}.html`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver producto
                      </a>
                    </div>
                    <div className="price">{infoDataSuperior?.priceFinal ? <div className="priceOld">AR$ {infoDataSuperior?.price}</div> : ''} <div>AR$ {infoDataSuperior?.priceFinal ? infoDataSuperior?.priceFinal : infoDataSuperior?.price}</div> </div>
                  </div>
                  <div className="content_gral_probador">
                    <div className="talles">
                      <div className="sizes_and_colors">

                        <ul className="colorBlock">
                          {dataColorSup && dataColorSup.length !== 0 &&
                            dataColorSup.map((item, index) => (
                              <li key={index} className={`${item?.stock === 0 ? 'disabled' : ''}`} style={{ backgroundColor: `${item.color_value}` }}>
                                <span onClick={item?.stock !== 0 ? () => colorAction(index, item, '2') : null} className={`${colorsStatus === index ? `active` : ''}`}>
                                </span>
                              </li>
                            ))}
                        </ul>
                        <ul className="sizesBlock">
                          {dataSizesSup &&
                            dataSizesSup.map((item, index) => (
                              <li key={index} className={`${item?.stock === 0 ? 'disabled' : ''}`}>
                                <span onClick={item?.stock !== 0 ? () => sizesActionSup(index, item, '2') : null} className={`${sizesStatus === index ? `active` : ''}`}>
                                  {item.color_value}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                      <TallesDiv className="sizes_info"><a href="/upper-garment-sizes" target='_blank'>Guia de talles</a> </TallesDiv>
                    </div>

                    <div className="actions_content">
                      <button
                        className="btn_add"
                        onClick={() => {
                          addToCart("2");
                        }}
                      >
                        Añadir al carrito
                      </button>
                      <button className="btn_remove" onClick={() => deleteItemBlock('2')}><img src={`${urlHost}/media/imageeditor/iconos/Delete.svg`} alt="" /></button>
                    </div>
                  </div>
                  <div className="alertText">
                    {messageErrorTalle} <br /> {messageErrorColor}
                  </div>
                </div>
              </div>
              <div className="block inferior" id="sectionBlockInf">
                <div className="imageMobile"><img id='featureImgInf' src={`${urlHost}/media/catalog/product${imagenProductMobileInf}`} alt="" /></div>
                <div className="info_detail">
                  <div className="head_info">
                    <div className="title_info">
                      <h2>{infoDataInferior?.name}</h2>
                      <a
                        href={`/${infoDataInferior.slug}.html`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver producto
                      </a>
                    </div>
                    <div className="price">{infoDataInferior?.priceFinal ? <div className="priceOld">AR$ {infoDataInferior?.price}</div> : ''} <div>AR$ {infoDataInferior?.priceFinal ? infoDataInferior?.priceFinal : infoDataInferior?.price}</div> </div>
                  </div>
                  <div className="content_gral_probador">
                    <div className="talles">
                      <div className="sizes_and_colors">
                        <ul className="colorBlock">
                          {dataColosInf && dataColosInf.length !== 0 &&
                            dataColosInf.map((item, index) => (
                              <li key={index} className={`${item?.stock === 0 ? 'disabled' : ''}`} style={{ backgroundColor: `${item.color_value}` }}>
                                <span onClick={item?.stock !== 0 ? () => colorActionInf(index, item, '3') : null} className={`${colorsStatusInf === index ? `active` : ''}`}>
                                </span>
                              </li>
                            ))}
                        </ul>
                        <ul className="sizesBlock">
                          {dataSizesInf &&
                            dataSizesInf.map((item, index) => (
                              <li key={index} className={`${item?.stock === 0 ? 'disabled' : ''}`}>
                                <span onClick={item?.stock !== 0 ? () => sizesActionInf(index, item, '3') : null} className={`${sizesStatusInf === index ? `active` : ''}`}>
                                  {item.color_value}
                                </span>
                              </li>
                            ))}
                        </ul>

                      </div>
                      <TallesDiv className="sizes_info"><a href="/lower-garment-sizes" target='_blank'>Guia de talles</a> </TallesDiv>
                    </div>

                    <div className="actions_content">
                      <button
                        className="btn_add"
                        onClick={() => {
                          addToCart("3");
                        }}
                      >
                        Añadir al carrito
                      </button>
                      <button className="btn_remove" onClick={() => deleteItemBlock('3')}><img src={`${urlHost}/media/imageeditor/iconos/Delete.svg`} alt="" /></button>
                    </div>
                  </div>
                  <div className="alertText">
                    {messageErrorTalleIInf} <br /> {messageErrorColorInf}
                  </div>
                </div>
              </div>
              <div className="section_add_cart_mobile">
                <div style={{ paddingTop: '10px' }}>

                  <span className="errorMess">{messageErrorTalle}  <br /> {messageErrorTalleIInf}</span>
                  <span className="errorMess">{messageErrorColor}  <br /> {messageErrorColorInf}</span>
                </div>

              </div>
            </div>
            {stepMobile === 'successAdd' &&
              <div className="viewInfoAddCard">
                <img src={`${urlHost}/media/imageeditor/iconos/icon_messageAdd.svg`} alt="" />
                <h2>¡Excelente elección!</h2>
                <p>Tu outfit te esta esperando en el carrito.</p>

                <div className="section_add_cart_mobile">
                  <button className="btnAddCartMobile" onClick={redirectCheckout}>Ir al carrito</button>
                  <button className="btnVolverMobile" onClick={volverCombinar}>Hacer otra combinacion</button>
                </div>

              </div>}
            {stepMobile === '' && (
              <div className="btnsBarFooter">
                <div className={`priceResume ${resumeAction ? 'show' : ''}`}>
                  <span className="btnShow" onClick={showResumeAction}><ArrowBtnMobile className={`${resumeAction ? 'flechaAbajo' : 'flechaArriba'}`}></ArrowBtnMobile></span>
                  <h3>Conoce el resumen</h3>
                  <div className={`itemInfo ${resumeAction ? 'show' : ''}`}>
                    <div className="item"><span>{infoDataSuperior?.name}</span><span>$ {infoDataSuperior?.priceFinal ? infoDataSuperior?.priceFinal : infoDataSuperior?.price}</span></div>
                    <div className="item"><span>{infoDataInferior?.name}</span><span>$ {infoDataInferior?.priceFinal ? infoDataInferior?.priceFinal : infoDataInferior?.price}</span></div>
                    <div className="item total"><span>Total</span><span>AR$
                      {(() => {
                        let totalSupx = 0
                        if (infoDataSuperior?.priceFinal) {
                          totalSupx = infoDataSuperior?.priceFinal
                        } else {
                          totalSupx = infoDataSuperior?.price
                        }

                        let totalInf = 0
                        if (infoDataInferior?.priceFinal) {
                          totalInf = infoDataInferior?.priceFinal
                        } else {
                          totalInf = infoDataInferior?.price
                        }
                        return ` ${totalSupx + totalInf}`
                      })()}
                    </span></div>
                  </div>
                </div>
                <button className="btn-buy-all_probador mobile" onClick={talleColorOptions}>
                  Quiero el Outfit Completo
                </button>
                <button className="btn-buy-all_probador desk" onClick={addCartAll}>
                  Añadir al carrito el look completo
                </button>
              </div>
            )}
            {stepMobile === 'seleccionTalleColor' ?
              <>
                <div className="btnsMobile">
                  <button className="btnAddCartMobile" onClick={productAddSuccess}>AÑADIR A LA BOLSA</button>
                  <button className="btnVolverMobile" onClick={volverCombinar}>Volver a combinar</button>
                </div>
              </>
              : (<>

              </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default App;

const BotonCarrito = styled.a`
  &.btn_cart_items_probador::before{
        background-image: url(${`${urlHost}/media/imageeditor/iconos/icon-shopping-cart.svg`});
  }
  &.btn_cart_items_probador::after{
    background-image: url(${`${urlHost}/media/imageeditor/iconos/icon-large-Arrow.svg`});
  }
`
const TallesDiv = styled.div`
  &.sizes_info::before{
    background-image: url(${`${urlHost}/media/imageeditor/iconos/icon-shirt.svg`});
  }
`
const ArrowBtnMobile = styled.span`
  &.flechaAbajo,&.flechaArriba{
    content: url(${`${urlHost}/media/imageeditor/iconos/icon-flecha-price.svg`});
  }
`
const BotonIncial = styled.button`
&.open-modal-probador::before{
  background-image: url(${`${urlHost}/media/imageeditor/iconos/icon-btn-combine.svg`});
} 
`
const BotonSubirBajar = styled.button`
&.btn_subir_bajer_probador::before{
  background-image: url(${`${urlHost}/media/imageeditor/iconos/icon-arrow-gallery.svg`});
} 
`

