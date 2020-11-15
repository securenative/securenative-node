import chai from 'chai';
import { SecureNativeOptions } from "./types/securenative-options";
import { clientIpFromRequest } from "./utils/utils";
import chaiAsPromised from "chai-as-promised";
import httpMocks from 'node-mocks-http';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('RequestUtils', () => {
    it('extract ip from request with proxy headers ipv4', () => {
        const options: SecureNativeOptions = {
            proxyHeaders: ['CF-Connecting-IP']
        };

        const ip = '203.0.113.1';
        const req = httpMocks.createRequest({
            headers: {'CF-Connecting-IP': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip from request with proxy headers ipv6', () => {
        const options: SecureNativeOptions = {
            proxyHeaders: ['CF-Connecting-IP']
        };

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'CF-Connecting-IP': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip from request with proxy headers multiple ipv4', () => {
        const options: SecureNativeOptions = {
            proxyHeaders: ['CF-Connecting-IP']
        };

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'CF-Connecting-IP': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using x-forwarded-for header ipv6', () => {
        const options: SecureNativeOptions = {};

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'x-forwarded-for': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using x-forwarded-for header multiple ipv4', () => {
        const options: SecureNativeOptions = {};

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'x-forwarded-for': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using x-client-ip header ipv6', () => {
        const options: SecureNativeOptions = {};

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'x-client-ip': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using x-client-ip header multiple ipv4', () => {
        const options: SecureNativeOptions = {};

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'x-client-ip': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using x-real-ip header ipv6', () => {
        const options: SecureNativeOptions = {};

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'x-real-ip': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using x-real-ip header multiple ipv4', () => {
        const options: SecureNativeOptions = {};

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'x-real-ip': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using x-forwarded header ipv6', () => {
        const options: SecureNativeOptions = {};

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'x-forwarded': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using x-forwarded header multiple ipv4', () => {
        const options: SecureNativeOptions = {};

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'x-forwarded': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using x-cluster-client-ip header ipv6', () => {
        const options: SecureNativeOptions = {};

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'x-cluster-client-ip': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using x-cluster-client-ip header multiple ipv4', () => {
        const options: SecureNativeOptions = {};

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'x-cluster-client-ip': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using forwarded-for header ipv6', () => {
        const options: SecureNativeOptions = {};

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'forwarded-for': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using forwarded-for header multiple ipv4', () => {
        const options: SecureNativeOptions = {};

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'forwarded-for': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using forwarded header ipv6', () => {
        const options: SecureNativeOptions = {};

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'forwarded': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using forwarded header multiple ipv4', () => {
        const options: SecureNativeOptions = {};

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'forwarded': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using via header ipv6', () => {
        const options: SecureNativeOptions = {};

        const ip = 'f71f:5bf9:25ff:1883:a8c4:eeff:7b80:aa2d';
        const req = httpMocks.createRequest({
            headers: {'via': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using via header multiple ipv4', () => {
        const options: SecureNativeOptions = {};

        const ip = '141.246.115.116, 203.0.113.1, 12.34.56.3'
        const expected = '141.246.115.116';
        const req = httpMocks.createRequest({
            headers: {'via': ip}
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });

    it('extract ip using priority with x forwarded for', () => {
        const options: SecureNativeOptions = {};

        const ip = '203.0.113.1';
        const req = httpMocks.createRequest({
            headers: {
                'x-forwarded-for': ip,
                'x-real-ip': '198.51.100.101',
                'x-client-ip': '198.51.100.102'
            }
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(ip);
    });

    it('extract ip using priority without x forwarded for', () => {
        const options: SecureNativeOptions = {};

        const ip = '203.0.113.1, 141.246.115.116, 12.34.56.3'
        const expected = '203.0.113.1';
        const req = httpMocks.createRequest({
            headers: {
                'x-real-ip': '203.0.113.1',
                'x-client-ip': ip
            }
        });

        const clientIp = clientIpFromRequest(req, options);
        expect(clientIp).to.eq(expected);
    });
});