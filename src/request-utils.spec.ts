import chai from 'chai';
import { SecureNativeOptions } from "./types/securenative-options";
import { clientIpFromRequest } from "./utils/utils";
import chaiAsPromised from "chai-as-promised";
import httpMocks from 'node-mocks-http';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('RequestUtils', () => {
    it('extract a request with proxy headers ipv4', () => {
        const options: SecureNativeOptions = {
            proxyHeaders: ['CF-Connecting-IP']
        };

        const ip = '203.0.113.1';
        const req  = httpMocks.createRequest({
            headers: {'CF-Connecting-IP': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract a request with proxy headers ipv6', () => {
        const options: SecureNativeOptions = {
            proxyHeaders: ['CF-Connecting-IP']
        };

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req  = httpMocks.createRequest({
            headers: {'CF-Connecting-IP': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract a request with proxy headers multiple ipv4', () => {
        const options: SecureNativeOptions = {
            proxyHeaders: ['CF-Connecting-IP']
        };

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req  = httpMocks.createRequest({
            headers: {'CF-Connecting-IP': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });
});