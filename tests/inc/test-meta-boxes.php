<?php

class TestMetaBoxes extends WP_UnitTestCase {
	function setUp() {
		parent::setUp();

		$this->editor = $this->factory->user->create();
		$user = get_user_by('id', $this->editor);
		$user->set_role('editor');
		wp_set_current_user($user->ID);

		$this->subscribed = $this->factory->post->create();
		$sub_meta = array(
			'pmp_subscribe_to_updates' => 'on',
			'pmp_guid' => 'tktk',
			'pmp_owner' => 'notmyguid'
		);
		foreach ($sub_meta as $key => $val)
			update_post_meta($this->subscribed, $key, $val);

		$this->not_subscribed = $this->factory->post->create();
		$not_sub_meta = array(
			'pmp_subscribe_to_updates' => 'off',
			'pmp_guid' => 'tktk',
			'pmp_owner' => 'notmyguid'
		);
		foreach ($not_sub_meta as $key => $val)
			update_post_meta($this->not_subscribed, $key, $val);
	}

	function test_pmp_mega_meta_box_subscribed() {
		$post = get_post($this->subscribed);
		$expect_checked = '/<input\s*checked=\'checked\'\s*type="checkbox"\s*name="pmp_subscribe_to_updates"\s*\/>/';
		$this->expectOutputRegex($expect_checked);
		pmp_mega_meta_box($post);
	}

	function test_pmp_mega_meta_box_not_subscribed() {
		$post = get_post($this->not_subscribed);
		$expect_unchecked = '/<input\s*type="checkbox"\s*name="pmp_subscribe_to_updates"\s*\/>/';
		$this->expectOutputRegex($expect_unchecked);
		pmp_mega_meta_box($post);
	}

	function test_pmp_subscribe_to_updates_markup() {
		$post = get_post($this->factory->post->create());
		pmp_subscribe_to_updates_markup($post);
		$this->expectOutputRegex('/checked/');
		$this->markTestIncomplete('This test has not been implemented yet.');
	}

	function test_pmp_subscribe_to_update_save() {
		$post = get_post($this->not_subscribed);

		$_POST['pmp_mega_meta_box_nonce'] = wp_create_nonce('pmp_mega_meta_box');
		$_POST['pmp_subscribe_to_updates'] = 'on';

		pmp_subscribe_to_update_save($post->ID);

		$meta = get_post_meta($post->ID, 'pmp_subscribe_to_updates', true);
		$this->assertEquals('on', $meta);
	}

	function test_pmp_save_override_defaults() {
		$this->markTestIncomplete('This test has not been implemented yet.');
	}

	function test_pmp_mega_meta_box_save() {
		$this->markTestIncomplete('This test has not been implemented yet.');
	}
}
