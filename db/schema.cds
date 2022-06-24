using { Currency, User, managed, cuid } from '@sap/cds/common';
namespace sap.capire.orders;

entity Orders : cuid, managed {
  OrderNo  : String @title:'Order Number';
  Items    : Composition of many {
    key ID    : UUID;
    product   : Association to Products;
    quantity  : Integer;
    title     : String;
    price     : Double;
  };
  buyer    : User;
  currency : Currency;
}

/** This is a stand-in for arbitrary ordered Products */
entity Products @(cds.persistence.skip:'always') {
  key ID : String;
}


// this is to ensure we have filled-in currencies
// using from '@capire/common';