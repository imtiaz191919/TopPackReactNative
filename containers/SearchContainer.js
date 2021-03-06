import React, { Component } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Button,
  ToastAndroid
} from "react-native";
import axios from "axios";
import _ from "lodash";
class SearchContainer extends Component {
  state = {
    pageNumber: null,
    showLoadMore: false,
    pageData: [],
    allRepositories: [],
    inputText: "",
    repositories: [],
    loading: false
  };
  componentDidMount() {
    this.setState({ allRepositories: [...this.props.allRepositories.ids] });
  }
  callimportRepo = (id, items) => {
    this.props.importRepo(id, items),
      this.setState({ allRepositories: [...this.state.allRepositories, id] });
  };
  searchRepositories = async () => {
    if (this.state.inputText !== "") {
      this.setState({ loading: true });
      let url =
        "https://api.github.com/search/repositories?q=" +
        this.state.inputText +
        "&page=1&per_page=100";
      let apiResponse = await axios.get(url);
      if (apiResponse.data.items.length > 0) {
        let structuredData = [];
        apiResponse.data.items.map(item => {
          let dataObject = {
            name: item.name,
            id: item.id,
            stars: item.stargazers_count,
            forks: item.forks
          };
          structuredData.push(dataObject);
        });

        this.setState({
          loading: false,
          pageNumber: 1,
          pageData: structuredData.slice(0, 10),
          repositories: structuredData
        });
      } else {
        ToastAndroid.show("No repositories found related to the search", 0.5);
        this.setState({
          loading: false
        });
      }
    } else {
      ToastAndroid.show("Enter a search String", 0.5);
    }
  };
  renderRepoItem = ({ item }) => {
    let dynamicStyle = {};
    let id = `${item.id}`;
    let alreadyExists = false;
    if (_.includes(this.state.allRepositories, id)) {
      dynamicStyle.backgroundColor = "#99ccff";
      alreadyExists = true;
    }
    return (
      <View key={id} style={[styles.repoContainer, dynamicStyle]}>
        <View style={{ flex: 3 }}>
          <Text style={[styles.repoElements, { fontSize: 25 }]}>
            {item.name}
          </Text>
          <Text style={styles.repoElements}>Stars: {item.stars}</Text>
          <Text style={styles.repoElements}>Forks: {item.forks}</Text>
        </View>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Button
            title="Import"
            onPress={() => {
              this.callimportRepo(id, item);
            }}
            disabled={alreadyExists}
          />
        </View>
      </View>
    );
  };
  getNextPage = () => {
    let start = this.state.pageNumber * 10;
    let end = start + 10;
    let newPageNumber = this.state.pageNumber + 1;
    let newData = [
      ...this.state.pageData,
      ...this.state.repositories.slice(start, end)
    ];
    console.log(
      "THIS IS THE NEW PAGE DATA : ------------------------------- >      " +
        start +
        " End " +
        end
    );
    this.setState({
      pageData: newData,
      pageNumber: newPageNumber
    });
  };
  render() {
    let loading = null;
    if (this.state.loading) {
      loading = (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#99ccff" />
        </View>
      );
    }
    let showSearchResult = null;
    if (this.state.pageData.length > 0) {
      showSearchResult = (
        <FlatList
          data={this.state.pageData}
          keyExtractor={item => `${item.id}`}
          extraData={this.props}
          renderItem={this.renderRepoItem}
          onEndReachedThreshold={0.0001}
          onEndReached={() => {
            this.getNextPage();
          }}
          ListFooterComponent={() => {
            return (
              <View style={{ height: 35 }}>
                <ActivityIndicator size="large" color="#99ccff" />
              </View>
            );
          }}
        />
      );
    }
    return (
      <View style={styles.searchContainer}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 22 }}>Search</Text>
          <TextInput
            onChangeText={event => {
              this.setState({ inputText: event });
            }}
            style={{ fontSize: 19 }}
            placeholder="Search for Repositories Here"
          />
          <Button
            onPress={() => {
              this.searchRepositories();
            }}
            title="Search"
          />
        </View>
        {loading}
        {showSearchResult}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  searchResult: {},
  searchButton: {
    margin: 20,
    width: 190,
    backgroundColor: "salmon",
    fontSize: 30
  },
  searchContainer: {
    flex: 14,
    padding: 2
  },
  repoContainer: {
    flexDirection: "row",
    margin: 0,
    borderBottomWidth: 0.8,
    padding: 3
  },
  repoElements: {
    padding: 5
  }
});

export default SearchContainer;
