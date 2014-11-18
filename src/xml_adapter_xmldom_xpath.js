"use strict";

var xpath = require('xpath')
var xmldom = require('xmldom');
var DOMParser = xmldom.DOMParser
var XmlAdapter = require("lens-converter").XmlAdapter;

var XmlAdapterXmlDomXpath = function() {
  XmlAdapter.call(this);
};

XmlAdapterXmlDomXpath.Prototype = function() {

  this.parseXML = function(xmlString) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlString);
    return xmlDoc;
  };

  this.findAll = function(el, xpathSel) {
    // TODO: the last arg is a ns resolver
    var elements = xpath.select(xpathSel, el);
    if (!elements) return [];
    return elements;
  };

  this.find = function(el, xpathSel) {
    return this.findAll(el, xpathSel)[0];
  };

  this.getElementById = function(el, id) {
    return this.find(el, ".//*[@id='"+id+"']");
  };

  this.getAttribute = function(el, name) {
    return el.getAttribute(name);
  };

  this.getType = function(el) {
    if (el.nodeType === el.TEXT_NODE) {
      return "text";
    } else if (el.nodeType === el.COMMENT_NODE) {
      return "comment";
    } else if (el.tagName) {
      return el.tagName.toLowerCase();
    } else {
      console.error("Can't get node type for ", el);
      return "unknown";
    }
  };

  this.toString = function(el) {
    return el.toString();
  };

  this.getText = function(el) {
    return el.textContent;
  };

  this.getChildNodes = function(el) {
    return el.childNodes;
  };

  this.getParent = function(el) {
    return el.parentNode;
  };

  this.getChildrenElements = function(parent) {
    var children = [];
    var el = parent.firstChild;
    while (el) {
      if (el.nodeType === 1) children.push(el);
      el = el.nextSibling;
    }
    return children;
  };

  this.getFirstElementChild = function(element) {
    var firstChild = element.firstChild;
    while (firstChild) {
      if (firstChild.nodeType === 1) return firstChild;
      firstChild = firstChild.nextSibling;
    }
    return null;
  };

  this.getNextElementSibling = function(el) {
    var next = el.nextSibling;
    while (next) {
      if (next.nodeType === 1) return next;
      next = next.nextSibling;
    }
    return;
  };

};
XmlAdapterXmlDomXpath.Prototype.prototype = XmlAdapter.prototype;
XmlAdapterXmlDomXpath.prototype = new XmlAdapterXmlDomXpath.Prototype();

module.exports = XmlAdapterXmlDomXpath;
