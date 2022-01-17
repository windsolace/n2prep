"use strict";

import _ from "lodash";
import "./css/main.less";
import "./css/normalize.css";
import "./js/vendor/modernizr-3.11.2.min.js";
import "./js/vendor/plugins.js";
import vocab from "./data/vocab.json";

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
const useMockVocab = true;

const n2Prep = (function () {
  const getData = (useMock) => {
    if (useMock) {
      generateCards(vocab);
    } else {
      $.get("data/vocab.json", (data) => {
        generateCards(data);
      });
    }
  };

  const generateCards = (data) => {
    let resultsTemplate = $("#resultsTemplate").html();
    let resultsDiv = document.getElementById("results");

    let cardTemplateFn = _.template(resultsTemplate);
    let resultList = data;

    _.forEach(resultList, function (result) {
      let templateHTML = cardTemplateFn(result);
      resultsDiv.innerHTML += templateHTML;
    });

    $(".flashcard").click((e) => {
      const $cardDef = $(e.currentTarget).find(".flashcard__definition");
      if ($cardDef.hasClass("hidden")) $cardDef.removeClass("hidden");
      else $cardDef.addClass("hidden");
      // $(e.currentTarget).find(".flashcard__definition").removeClass("hidden");
    });
  };

  const init = () => {
    getData(useMockVocab);
  };

  return {
    init: init,
  };
})();

n2Prep.init();
