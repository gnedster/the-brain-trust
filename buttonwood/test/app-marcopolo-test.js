var assert = require('assert');
var marcopolo = require('../app/marcopolo.js');

describe('marcopolo', function(){
  it('should generate an attachment from an Amazon object', function() {
    const amazonItem = { ASIN: [ 'B01LYT95XR' ],
      ParentASIN: [ 'B01LS29SP6' ],
      DetailPageURL: [ 'https://www.amazon.com/Apple-iPhone-Unlocked-32-GB/dp/B01LYT95XR%3Fpsc%3D1%26SubscriptionId%3DAKIAIYSVAZP2PFTSKW3Q%26tag%3Dthebraintru09-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D165953%26creativeASIN%3DB01LYT95XR' ],
      ItemLinks:
      [ { ItemLink:
        [ { Description: [ 'Technical Details' ],
        URL: [ 'https://www.amazon.com/Apple-iPhone-Unlocked-32-GB/dp/tech-data/B01LYT95XR%3FSubscriptionId%3DAKIAIYSVAZP2PFTSKW3Q%26tag%3Dthebraintru09-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB01LYT95XR' ] },
        { Description: [ 'Add To Baby Registry' ],
        URL: [ 'https://www.amazon.com/gp/registry/baby/add-item.html%3Fasin.0%3DB01LYT95XR%26SubscriptionId%3DAKIAIYSVAZP2PFTSKW3Q%26tag%3Dthebraintru09-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB01LYT95XR' ] },
        { Description: [ 'Add To Wedding Registry' ],
        URL: [ 'https://www.amazon.com/gp/registry/wedding/add-item.html%3Fasin.0%3DB01LYT95XR%26SubscriptionId%3DAKIAIYSVAZP2PFTSKW3Q%26tag%3Dthebraintru09-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB01LYT95XR' ] },
        { Description: [ 'Add To Wishlist' ],
        URL: [ 'https://www.amazon.com/gp/registry/wishlist/add-item.html%3Fasin.0%3DB01LYT95XR%26SubscriptionId%3DAKIAIYSVAZP2PFTSKW3Q%26tag%3Dthebraintru09-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB01LYT95XR' ] },
        { Description: [ 'Tell A Friend' ],
        URL: [ 'https://www.amazon.com/gp/pdp/taf/B01LYT95XR%3FSubscriptionId%3DAKIAIYSVAZP2PFTSKW3Q%26tag%3Dthebraintru09-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB01LYT95XR' ] },
        { Description: [ 'All Customer Reviews' ],
        URL: [ 'https://www.amazon.com/review/product/B01LYT95XR%3FSubscriptionId%3DAKIAIYSVAZP2PFTSKW3Q%26tag%3Dthebraintru09-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB01LYT95XR' ] },
        { Description: [ 'All Offers' ],
        URL: [ 'https://www.amazon.com/gp/offer-listing/B01LYT95XR%3FSubscriptionId%3DAKIAIYSVAZP2PFTSKW3Q%26tag%3Dthebraintru09-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB01LYT95XR' ] } ] } ],
        SmallImage:
        [ { URL: [ 'https://images-na.ssl-images-amazon.com/images/I/41q97rMijoL._SL75_.jpg' ],
        Height: [ { _: '56', '$': { Units: 'pixels' } } ],
        Width: [ { _: '75', '$': { Units: 'pixels' } } ] } ],
        MediumImage:
        [ { URL: [ 'https://images-na.ssl-images-amazon.com/images/I/41q97rMijoL._SL160_.jpg' ],
        Height: [ { _: '120', '$': { Units: 'pixels' } } ],
        Width: [ { _: '160', '$': { Units: 'pixels' } } ] } ],
        LargeImage:
        [ { URL: [ 'https://images-na.ssl-images-amazon.com/images/I/41q97rMijoL.jpg' ],
        Height: [ { _: '375', '$': { Units: 'pixels' } } ],
        Width: [ { _: '500', '$': { Units: 'pixels' } } ] } ],
      ImageSets:
        [ { ImageSet:
          [ { '$': { Category: 'primary' },
          SwatchImage:
          [ { URL: [ 'https://images-na.ssl-images-amazon.com/images/I/41q97rMijoL._SL30_.jpg' ],
          Height: [ { _: '22', '$': { Units: 'pixels' } } ],
          Width: [ { _: '30', '$': { Units: 'pixels' } } ] } ],
          SmallImage:
          [ { URL: [ 'https://images-na.ssl-images-amazon.com/images/I/41q97rMijoL._SL75_.jpg' ],
          Height: [ { _: '56', '$': { Units: 'pixels' } } ],
          Width: [ { _: '75', '$': { Units: 'pixels' } } ] } ],
          ThumbnailImage:
          [ { URL: [ 'https://images-na.ssl-images-amazon.com/images/I/41q97rMijoL._SL75_.jpg' ],
          Height: [ { _: '56', '$': { Units: 'pixels' } } ],
          Width: [ { _: '75', '$': { Units: 'pixels' } } ] } ],
          TinyImage:
          [ { URL: [ 'https://images-na.ssl-images-amazon.com/images/I/41q97rMijoL._SL110_.jpg' ],
          Height: [ { _: '82', '$': { Units: 'pixels' } } ],
          Width: [ { _: '110', '$': { Units: 'pixels' } } ] } ],
          MediumImage:
          [ { URL: [ 'https://images-na.ssl-images-amazon.com/images/I/41q97rMijoL._SL160_.jpg' ],
          Height: [ { _: '120', '$': { Units: 'pixels' } } ],
          Width: [ { _: '160', '$': { Units: 'pixels' } } ] } ],
          LargeImage:
          [ { URL: [ 'https://images-na.ssl-images-amazon.com/images/I/41q97rMijoL.jpg' ],
          Height: [ { _: '375', '$': { Units: 'pixels' } } ],
          Width: [ { _: '500', '$': { Units: 'pixels' } } ] } ],
          HiResImage:
          [ { URL: [ 'https://images-na.ssl-images-amazon.com/images/I/91uJLEPfyoL.jpg' ],
          Height: [ { _: '1920', '$': { Units: 'pixels' } } ],
          Width: [ { _: '2560', '$': { Units: 'pixels' } } ] } ] } ] } ],
      ItemAttributes:
          [ { Binding: [ 'Wireless Phone Accessory' ],
          Brand: [ 'Apple' ],
          Color: [ 'Black' ],
          EAN: [ '0724393155429' ],
          EANList: [ { EANListElement: [ '0724393155429' ] } ],
          Feature:
          [ 'Keep everything you love about iPhone up to date, secure, and accessible from any device with iCloud.',
          'Multi-Touch display with IPS technology.',
          'With just a single press, 3D Touch lets you do more than ever before.',
          'The 12-megapixel iSight camera captures sharp, detailed photos. It takes 4K video, up to four times the resolution of 1080p HD video.' ],
          IsEligibleForTradeIn: [ '1' ],
          ItemDimensions:
          [ { Height: [ { _: '28', '$': { Units: 'hundredths-inches' } } ],
          Length: [ { _: '544', '$': { Units: 'hundredths-inches' } } ],
          Weight: [ { _: '30', '$': { Units: 'hundredths-pounds' } } ],
          Width: [ { _: '264', '$': { Units: 'hundredths-inches' } } ] } ],
          Label: [ 'Apple' ],
          ListPrice:
          [ { Amount: [ '64900' ],
          CurrencyCode: [ 'USD' ],
          FormattedPrice: [ '$649.00' ] } ],
          Manufacturer: [ 'Apple' ],
          Model: [ 'Unlocked 32 GB - US (Black)' ],
          MPN: [ 'Unlocked 32 GB - US (Black)' ],
          PackageDimensions:
          [ { Height: [ { _: '200', '$': { Units: 'hundredths-inches' } } ],
          Length: [ { _: '640', '$': { Units: 'hundredths-inches' } } ],
          Weight: [ { _: '85', '$': { Units: 'hundredths-pounds' } } ],
          Width: [ { _: '350', '$': { Units: 'hundredths-inches' } } ] } ],
          PackageQuantity: [ '1' ],
          PartNumber: [ 'Unlocked 32 GB - US (Black)' ],
          ProductGroup: [ 'Wireless' ],
          ProductTypeName: [ 'WIRELESS_ACCESSORY' ],
          Publisher: [ 'Apple' ],
          Size: [ '32 GB' ],
          Studio: [ 'Apple' ],
          Title: [ 'Apple iPhone 7 Unlocked Phone 32 GB - US Version (Black)' ],
          TradeInValue:
          [ { Amount: [ '27197' ],
          CurrencyCode: [ 'USD' ],
          FormattedPrice: [ '$271.97' ] } ],
          UPC: [ '724393155429' ],
          UPCList: [ { UPCListElement: [ '724393155429' ] } ] } ],
      OfferSummary:
        [ { LowestNewPrice:
            [ { Amount: [ '65990' ],
            CurrencyCode: [ 'USD' ],
            FormattedPrice: [ '$659.90' ] } ],
            LowestUsedPrice:
            [ { Amount: [ '57094' ],
            CurrencyCode: [ 'USD' ],
            FormattedPrice: [ '$570.94' ] } ],
            LowestRefurbishedPrice:
            [ { Amount: [ '79499' ],
            CurrencyCode: [ 'USD' ],
            FormattedPrice: [ '$794.99' ] } ],
            TotalNew: [ '31' ],
            TotalUsed: [ '16' ],
            TotalCollectible: [ '0' ],
            TotalRefurbished: [ '1' ] } ],
        Offers:
        [ { TotalOffers: [ '3' ],
        TotalOfferPages: [ '1' ],
        MoreOffersUrl: [ 'https://www.amazon.com/gp/offer-listing/B01LYT95XR%3FSubscriptionId%3DAKIAIYSVAZP2PFTSKW3Q%26tag%3Dthebraintru09-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D386001%26creativeASIN%3DB01LYT95XR' ],
        Offer:
        [ { OfferAttributes: [ { Condition: [ 'New' ] } ],
        OfferListing:
        [ { OfferListingId: [ 'dAsXEVToUBAvmNfsGwbPTkoWm7L4D19x3M1Uy7GsR9kjvhH4gLqTXSZRYK136xOG7dgM4T8WcUexDV%2BoU2yuLZ3F%2FABLQdpj%2B5ITPG%2BTjxRAJNVTOgOHCAJ5LjLe72LEew7imPOrxuFfQV2yhWUIcQ%3D%3D' ],
        Price:
        [ { Amount: [ '65990' ],
        CurrencyCode: [ 'USD' ],
        FormattedPrice: [ '$659.90' ] } ],
        Availability: [ 'Usually ships in 1-2 business days' ],
        AvailabilityAttributes:
        [ { AvailabilityType: [ 'now' ],
        MinimumHours: [ '24' ],
        MaximumHours: [ '48' ] } ],
        IsEligibleForSuperSaverShipping: [ '0' ],
        IsEligibleForPrime: [ '0' ] } ] },
        { OfferAttributes: [ { Condition: [ 'Used' ] } ],
        OfferListing:
        [ { OfferListingId: [ 'dAsXEVToUBAvmNfsGwbPTkoWm7L4D19xGKYuj5XEfUhbTAUAw29AACrNesZYbQIqg2LaV957pwJj5HGmHNphshD1OEVURFcTnRdprAU8NCfcoCeIToj%2FZm2th53HyFH%2BhSRznDcysj87I%2FumCb7vVykIea9lz4ao' ],
        Price:
        [ { Amount: [ '57094' ],
        CurrencyCode: [ 'USD' ],
        FormattedPrice: [ '$570.94' ] } ],
        AmountSaved:
        [ { Amount: [ '7806' ],
        CurrencyCode: [ 'USD' ],
        FormattedPrice: [ '$78.06' ] } ],
        PercentageSaved: [ '12' ],
        Availability: [ 'Usually ships in 1-2 business days' ],
        AvailabilityAttributes:
        [ { AvailabilityType: [ 'now' ],
        MinimumHours: [ '24' ],
        MaximumHours: [ '48' ] } ],
        IsEligibleForSuperSaverShipping: [ '0' ],
        IsEligibleForPrime: [ '0' ] } ] },
        { OfferAttributes: [ { Condition: [ 'Refurbished' ] } ],
        OfferListing:
        [ { OfferListingId: [ 'dAsXEVToUBAvmNfsGwbPTkoWm7L4D19xBG%2FYKXTXioIwLSp6VoD95J0%2BFPyk3Q9PNgf3mEdlaTB4z%2BtPZq%2F1zdhfU3gWdtKI5LJm94lv%2FD6Upep%2BQAfOntfEWs14KYYmnND6ZEtch7I%2BgI%2FWAHrOuQ%3D%3D' ],
        Price:
        [ { Amount: [ '79499' ],
        CurrencyCode: [ 'USD' ],
        FormattedPrice: [ '$794.99' ] } ],
        Availability: [ 'Usually ships in 1-2 business days' ],
        AvailabilityAttributes:
        [ { AvailabilityType: [ 'now' ],
        MinimumHours: [ '24' ],
        MaximumHours: [ '48' ] } ],
        IsEligibleForSuperSaverShipping: [ '0' ],
        IsEligibleForPrime: [ '0' ] } ] } ] } ],
      EditorialReviews:
        [ { EditorialReview:
          [ { Source: [ 'Product Description' ],
          Content: [ 'The latest iPhone with advanced camera, better battery life, immersive speakers and water resistance!' ],
          IsLinkSuppressed: [ '0' ] } ] } ]
      };

    const attachment = marcopolo.generateAttachments(amazonItem);
    assert(attachment);
  });
});
