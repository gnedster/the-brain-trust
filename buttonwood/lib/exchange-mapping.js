/* This is JS Map instead of RDS as the mapping is small
 * If this gets big we should consider it being in RDS
 */
var exchangeMap = new Map();

exchangeMap.set('TSX', 'TOR');
exchangeMap.set('TOR', 'TOR');

exchangeMap.set('PNK', 'PNK');
exchangeMap.set('OTCMKTS','PNK');

exchangeMap.set('NMS', 'NMS');
exchangeMap.set('NASDAQ','NMS');
exchangeMap.set('NDAQ','NMS');

exchangeMap.set('NYQ', 'NYQ');
exchangeMap.set('NYSE','NYQ');

exchangeMap.set('KOE', 'KOE');
exchangeMap.set('KOSDAQ','KOE');

exchangeMap.set('IST', 'IST');
exchangeMap.set('BIST','IST');

exchangeMap.set('OTCBB','OBB');
exchangeMap.set('OBB', 'OBB');

exchangeMap.set('BCBA;','BUE');
exchangeMap.set('BUE', 'BUE');

exchangeMap.set('FWB','FRA');
exchangeMap.set('FRA', 'FRA');

exchangeMap.set('SEHK','HKG');
exchangeMap.set('HKG', 'HKG');

exchangeMap.set('SGX','SES');
exchangeMap.set('SES', 'SES');

exchangeMap.set('BSE', 'BSE');
exchangeMap.set('LSE', 'LSE');
exchangeMap.set('ASE', 'ASE');
exchangeMap.set('JKT', 'JKT');
exchangeMap.set('MEX', 'MEX');
exchangeMap.set('KLS', 'KLS');
exchangeMap.set('TWO', 'TWO');
exchangeMap.set('DUS', 'DUS');
exchangeMap.set('TAI', 'TAI');
exchangeMap.set('BER', 'BER');
exchangeMap.set('MUN', 'MUN');
exchangeMap.set('EUX', 'EUX');
exchangeMap.set('NSI', 'NSI');
exchangeMap.set('ISE', 'ISE');
exchangeMap.set('NCM', 'NCM');
exchangeMap.set('GER', 'GER');
exchangeMap.set('VAN', 'VAN');
exchangeMap.set('STU', 'STU');
exchangeMap.set('HAN', 'HAN');
exchangeMap.set('DOH', 'DOH');
exchangeMap.set('NGM', 'NGM');
exchangeMap.set('ASX', 'ASX');
exchangeMap.set('PAR', 'PAR');
exchangeMap.set('STO', 'STO');
exchangeMap.set('TLV', 'TLV');
exchangeMap.set('MCE', 'MCE');
exchangeMap.set('KSC', 'KSC');
exchangeMap.set('EBS', 'EBS');
exchangeMap.set('HAM', 'HAM');
exchangeMap.set('SET', 'SET');
exchangeMap.set('MCX', 'MCX');
exchangeMap.set('SAO', 'SAO');
exchangeMap.set('OSL', 'OSL');
exchangeMap.set('ATH', 'ATH');
exchangeMap.set('NZE', 'NZE');
exchangeMap.set('VIE', 'VIE');
exchangeMap.set('ICE', 'ICE');
exchangeMap.set('MIL', 'MIL');
exchangeMap.set('LIS', 'LIS');
exchangeMap.set('AMS', 'AMS');
exchangeMap.set('HEL', 'HEL');
exchangeMap.set('CPH', 'CPH');
exchangeMap.set('CCS', 'CCS');
exchangeMap.set('BRU', 'BRU');
exchangeMap.set('SHH', 'SHH');
exchangeMap.set('IOB', 'IOB');
exchangeMap.set('RIS', 'RIS');
exchangeMap.set('PCX', 'PCX');
exchangeMap.set('TLO', 'TLO');
exchangeMap.set('VTX', 'VTX');
exchangeMap.set('LIT', 'LIT');
exchangeMap.set('BTS', 'BTS');
exchangeMap.set('SSE', 'SSE');


/* These are left out as they only are used for index */
//exchangeMap.set('NYSE', 'NYSE');
//exchangeMap.set('NASDAQ', 'NASDAQ');
module.exports = exchangeMap;
