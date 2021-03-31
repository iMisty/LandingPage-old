/*
 * @Description: 搜索控件
 * @version: 1.0.0
 * @Author: Miya
 * @Date: 2020-05-26 21:41:27
 * @LastEditors: Miya
 * @LastEditTime: 2020-09-30 17:41:35
 */
import { Component, Vue } from 'vue-property-decorator';
import svgicon from '@/components/svgicon';
import engine from '@/components/Home/engine';
import associate from '@/components/Home/associate';
import { getEngineValue } from '@/utils/getEngineValue.ts';
import { searchData } from '@/config/search.config';
import { USER_DATA } from '@/config/dataname.config';
import { submitSearch } from '@/utils/submitSearch';
import { getExtraData } from '@/utils/GetSearchExtra';
@Component({
  components: {
    engine,
    svgicon,
    associate
  }
})
export default class Search extends Vue {
  // 控制搜索框样式
  private isInputing: boolean = false;
  // 判断搜索引擎选择列表是否开启
  private searchMenu: boolean = false;
  // 搜索框文字
  private searchText: string = '';
  // 搜索引擎选择数组
  private searchChoose: any = [];
  // 当前选择的搜索引擎
  private choose: string = 'baidu';
  // // 搜索引擎可选的自带参数
  // private extraParam: string | undefined = '';
  // 搜索引擎联想关键词
  private extraDatas: string[] = [];

  /**
   * @name: handleSearchMenu
   * @msg: 弹出搜索引擎选择框
   * @param {type}
   * @return: void
   */
  private handleSearchMenu(status: boolean): void {
    this.$emit('handleSearchMenu');
    this.searchMenu = status;
  }

  /**
   * @name: handleInput
   * @msg: 切换点击 input 时输入框样式
   * @param {type}
   * @return: void
   */
  private setInputStatus(stat: boolean): void {
    this.$store.commit('is_inputing', stat);
    this.isInputing = stat;
  }

  /**
   * @name: getSearchEngines
   * @msg: 获取搜索引擎组件数据
   * @param {type}
   * @return: void
   */
  private getSearchEngines(): void {
    const data = searchData;
    this.searchChoose = data;
  }

  /**
   * @name: getDefaultSearchEngines
   * @msg: 获取默认搜索引擎
   * @param {type}
   * @return: void
   */
  private getDefaultSearchEngines() {
    const defaultSearch = localStorage.getItem(USER_DATA);
    if (defaultSearch !== null) {
      const search = JSON.parse(defaultSearch).default_search;
      this.choose = search;
    }
  }

  /**
   * @name: handleChooseSearchEngine
   * @msg: 点击获取使用的搜索引擎
   * @param {type}
   * @return: void
   */
  private handleChooseSearch(index: number): void {
    const data = getEngineValue(index);
    this.choose = data;
    this.$store.commit('set_search_engine', data);
    // this.extraParam = this.searchChoose[index].extra;
    this.searchMenu = false;
  }

  /**
   * @description: 提交欲搜索的关键词
   * @param {type} e
   * @return: boolean
   * @author: Miya
   */
  private submitSearchText(e: { keyCode: number }, submit: boolean) {
    const choose = this.choose;
    const text = this.searchText;
    if (e.keyCode === 13 || submit === true) {
      window.open(submitSearch(choose!, text));
      return true;
    }
    return false;
  }

  // 获取联想词
  private async getSearchExtra() {
    const search = this.choose;
    const keyword = this.searchText;
    try {
      const extra = await getExtraData(search, keyword);
      console.dir(extra.data);
      this.extraDatas = extra.data;
    } catch (err) {
      this.extraDatas = [];
      console.log(err);
    }
  }

  private mounted() {
    this.getSearchEngines();
    this.getDefaultSearchEngines();
  }

  // 计算在输入内容时显示的class
  private get inputing() {
    return this.isInputing ? 'inputing' : '';
  }
  private get searchMenuActive() {
    return this.searchMenu ? 'active' : '';
  }

  // 计算图片
  private get getChooseImg() {
    const temp: string = this.choose;
    const temparray = this.$store.state.searchList;
    return temparray.findIndex((item: { name: string }) => item.name === temp);
  }

  // 获取搜索框右侧搜索按钮的搜索引擎名称
  private get getCHName() {
    const choose = this.choose;
    const temp = this.$store.state.searchList.map(
      (item: { text: string; name: string }) => {
        return {
          text: item.text,
          name: item.name
        };
      }
    );
    const index = temp.findIndex(
      (item: { name: string }) => item.name === choose
    );
    return temp[index].text;
  }

  private render() {
    return (
      <div class="search--bar">
        {/* 搜索引擎logo部分 */}
        <div class="search--bar-logo">
          <img src={require('@/assets/logo.svg')} alt="Logo" />
        </div>
        {/* 搜索引擎内容部分 */}
        <div class={`search--bar-wrap ${this.inputing}`}>
          <section
            class="search--bar-choose"
            onMouseover={() => this.handleSearchMenu(true)}
            onMouseout={() => this.handleSearchMenu(false)}
          >
            <div class="search--bar-choose-engine" data-choose={this.choose}>
              <img
                src={this.$store.state.searchList[this.getChooseImg].icon}
                style="width: 1.5rem"
              />
            </div>
            <ul class={`choose-engine ${this.searchMenuActive}`}>
              {this.searchChoose.map(
                (item: { icon: string; text: string }, index: number) => {
                  return (
                    <engine
                      icon={item.icon}
                      value={item.text}
                      onChoose={() => this.handleChooseSearch(index)}
                    ></engine>
                  );
                }
              )}
            </ul>
          </section>
          <section class="search--bar-input">
            <input
              type="text"
              placeholder="请输入搜索内容"
              v-model={this.searchText}
              onClick={() => this.setInputStatus(true)}
              onBlur={() => this.setInputStatus(false)}
              onInput={this.getSearchExtra}
              onKeydown={(e: any) => this.submitSearchText(e, false)}
            />
          </section>
          <section
            class="search--bar-submit"
            onClick={(e: any) => this.submitSearchText(e, true)}
          >
            <button>{this.getCHName}一下</button>
          </section>
          {this.extraDatas.length !== 0 && this.extraDatas[0] !== '' ? (
            <associate data={this.extraDatas}></associate>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }
}
