'use client';

import React from 'react';
import Link from 'next/link';
import { Layout, Typography, Row, Col, Input, Button, Divider } from 'antd';
import { 
  FacebookOutlined, 
  TwitterOutlined, 
  InstagramOutlined, 
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function Footer() {
  return (
    <AntFooter className="bg-gray-800 text-white pt-16 pb-8 px-4">
      <div className="container mx-auto">
        <Row gutter={[32, 32]}>
          {/* About Section */}
          <Col xs={24} sm={24} md={8} lg={8}>
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-2" role="img" aria-label="Blood Drop">🩸</span>
              <Title level={4} className="text-white mb-0">Blood Donation System</Title>
            </div>
            <Paragraph className="text-gray-300">
              We are dedicated to making blood donation accessible to everyone. Our mission is to connect donors with those in need and save lives across the country.
            </Paragraph>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-white hover:text-red-400 text-xl">
                <FacebookOutlined />
              </a>
              <a href="#" className="text-white hover:text-red-400 text-xl">
                <TwitterOutlined />
              </a>
              <a href="#" className="text-white hover:text-red-400 text-xl">
                <InstagramOutlined />
              </a>
              <a href="#" className="text-white hover:text-red-400 text-xl">
                <YoutubeOutlined />
              </a>
            </div>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={8} lg={8}>
            <Title level={4} className="text-white">Quick Links</Title>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <ul className="list-none p-0 m-0">
                  <li className="mb-2">
                    <Link href="/" className="text-gray-300 hover:text-red-400">Home</Link>
                  </li>
                  <li className="mb-2">
                    <Link href="/about" className="text-gray-300 hover:text-red-400">About Us</Link>
                  </li>
                  <li className="mb-2">
                    <Link href="/donate" className="text-gray-300 hover:text-red-400">Donate Blood</Link>
                  </li>
                  <li className="mb-2">
                    <Link href="/events" className="text-gray-300 hover:text-red-400">Blood Drives</Link>
                  </li>
                </ul>
              </div>
              <div>
                <ul className="list-none p-0 m-0">
                  <li className="mb-2">
                    <Link href="/blog-post" className="text-gray-300 hover:text-red-400">Blog</Link>
                  </li>
                  <li className="mb-2">
                    <Link href="/faq" className="text-gray-300 hover:text-red-400">FAQs</Link>
                  </li>
                  <li className="mb-2">
                    <Link href="/privacy" className="text-gray-300 hover:text-red-400">Privacy Policy</Link>
                  </li>
                  <li className="mb-2">
                    <Link href="/contact" className="text-gray-300 hover:text-red-400">Contact Us</Link>
                  </li>
                </ul>
              </div>
            </div>
          </Col>

          {/* Contact & Newsletter */}
          <Col xs={24} sm={12} md={8} lg={8}>
            <Title level={4} className="text-white">Contact Us</Title>
            <ul className="list-none p-0 m-0">
              <li className="mb-3 flex items-center">
                <EnvironmentOutlined className="mr-2" />
                <Text className="text-gray-300">123 Blood Center St, City, Country</Text>
              </li>
              <li className="mb-3 flex items-center">
                <PhoneOutlined className="mr-2" />
                <Text className="text-gray-300">+1 (123) 456-7890</Text>
              </li>
              <li className="mb-3 flex items-center">
                <MailOutlined className="mr-2" />
                <Text className="text-gray-300">info@blooddonation.com</Text>
              </li>
            </ul>
            
            <Title level={5} className="text-white mt-6">Subscribe to Newsletter</Title>
            <div className="flex">
              <Input placeholder="Your email" className="rounded-r-none" />
              <Button type="primary" className="bg-red-600 hover:bg-red-700 rounded-l-none">
                Subscribe
              </Button>
            </div>
          </Col>
        </Row>
        
        <Divider className="bg-gray-600 mt-8 mb-6" />
        
        <div className="text-center text-gray-400">
          <p>© {new Date().getFullYear()} Blood Donation System. All rights reserved.</p>
        </div>
      </div>
    </AntFooter>
  );
} 